import 'dotenv/config';
import net from 'net';
import {ApplicationConfig} from '@loopback/core';
import {Lb4Application} from './application';
import {runMigrations} from './services/db-migration.service';
import {SnackpackDataSource} from './datasources';
export * from './application';

async function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findAvailablePort(startPort: number, host: string): Promise<number> {
  const maxAttempts = 20;

  for (let offset = 0; offset < maxAttempts; offset++) {
    const candidatePort = startPort + offset;
    // Probe ports sequentially so app can move off busy 3000 automatically.
    if (await isPortAvailable(candidatePort, host)) {
      return candidatePort;
    }
  }

  throw new Error(`No available port found from ${startPort} to ${startPort + maxAttempts - 1}`);
}

export async function main(options: ApplicationConfig = {}) {
  const app = new Lb4Application(options);
  await app.boot();

  // Run database migrations
  try {
    const dataSource = await app.get('datasources.snackpack');
    await runMigrations(dataSource as SnackpackDataSource);
  } catch (error) {
    console.warn('Migration warning:', error);
  }

  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const preferredPort = +(process.env.PORT ?? 3000);
  const host = process.env.HOST || '127.0.0.1';

  const config = {
    rest: {
      port: preferredPort,
      host,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };

  findAvailablePort(preferredPort, host)
    .then(port => {
      if (port !== preferredPort) {
        console.warn(`Port ${preferredPort} is in use. Starting server on port ${port} instead.`);
      }
      config.rest.port = port;
      return main(config);
    })
    .catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
