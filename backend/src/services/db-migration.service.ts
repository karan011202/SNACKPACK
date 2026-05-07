import {SnackpackDataSource} from '../datasources';

export async function runMigrations(dataSource: SnackpackDataSource): Promise<void> {
  try {
    console.log('Running database migrations...');

    const connector = dataSource.connector as any;

    if (!connector || typeof connector.execute !== 'function') {
      console.warn('Database connector not available, skipping migrations');
      return;
    }

    // Keep the legacy table for older code paths.
    const createLegacyTableSql = `
      CREATE TABLE IF NOT EXISTS public.otps (
        id VARCHAR(255) PRIMARY KEY,
        phone VARCHAR(15) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
      )
    `;

    const createLegacyIndexPhoneSql = `
      CREATE INDEX IF NOT EXISTS idx_otps_phone ON public.otps(phone)
    `;

    const createLegacyIndexExpiresSql = `
      CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON public.otps(expires_at)
    `;

    // Ensure the active auth code can read and write otp_logs.
    const createOtpLogsTableSql = `
      CREATE TABLE IF NOT EXISTS public.otp_logs (
        otp_id INTEGER PRIMARY KEY,
        phone_number VARCHAR(15) NULL,
        otp_code VARCHAR(6) NULL,
        otp_expiry TIMESTAMP WITHOUT TIME ZONE NULL,
        is_used BOOLEAN NULL,
        is_active BOOLEAN NULL,
        valid_flag BOOLEAN NULL,
        created_on_server TIMESTAMP WITHOUT TIME ZONE NULL,
        created_by VARCHAR(50) NULL
      )
    `;

    const ensureOtpLogsCreatedBySql = `
      ALTER TABLE public.otp_logs
      ADD COLUMN IF NOT EXISTS created_by VARCHAR(50)
    `;

    const ensureOtpLogsIndexesSql = [
      `CREATE INDEX IF NOT EXISTS idx_otp_logs_phone_number ON public.otp_logs(phone_number)`,
      `CREATE INDEX IF NOT EXISTS idx_otp_logs_otp_expiry ON public.otp_logs(otp_expiry)`,
    ];

    const executeSql = (sql: string): Promise<void> =>
      new Promise((resolve, reject) => {
        connector.execute(sql, [], {}, (err: unknown) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });

    await executeSql(createLegacyTableSql);
    console.log('✓ Legacy OTP table ensured');

    await executeSql(createLegacyIndexPhoneSql);
    console.log('✓ Legacy phone index ensured');

    await executeSql(createLegacyIndexExpiresSql);
    console.log('✓ Legacy expiry index ensured');

    await executeSql(createOtpLogsTableSql);
    await executeSql(ensureOtpLogsCreatedBySql);
    for (const sql of ensureOtpLogsIndexesSql) {
      await executeSql(sql);
    }
    console.log('✓ OTP logs table ensured');

    console.log('✓ Database migrations completed successfully');

  } catch (error) {
    console.warn('Migration warning:', error instanceof Error ? error.message : error);
  }
}
