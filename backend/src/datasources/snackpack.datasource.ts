import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'snackpack',
  connector: 'postgresql',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1234',
  database: 'SNACKPACK'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class SnackpackDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'snackpack';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.snackpack', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
