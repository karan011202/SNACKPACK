import {SnackpackDataSource} from '../datasources';

export async function runMigrations(dataSource: SnackpackDataSource): Promise<void> {
  try {
    console.log('Running database migrations...');

    // Get the database connector
    const connector = dataSource.connector;

    // Execute OTP table creation
    const sql = `
      CREATE TABLE IF NOT EXISTS public.otps (
        id VARCHAR(255) PRIMARY KEY,
        phone VARCHAR(15) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_otps_phone ON public.otps(phone);
      CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON public.otps(expires_at);
    `;

    // Execute the SQL
    if (connector && 'execute' in connector) {
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      for (const command of commands) {
        await (connector as any).execute(command);
      }

      console.log('✓ Database migrations completed successfully');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
