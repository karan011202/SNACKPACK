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

    const ensureOrderItemsItemNameSql = `
      ALTER TABLE public.order_items
      ADD COLUMN IF NOT EXISTS item_name VARCHAR(255)
    `;

    const backfillOrderItemsItemNameSql = `
      UPDATE public.order_items oi
      SET item_name = COALESCE(oi.item_name, mi.name)
      FROM public.menu_items mi
      WHERE oi.menu_item_id = mi.id
        AND (oi.item_name IS NULL OR oi.item_name = '')
    `;

    const ensureOrderItemsVariantNameSql = `
      ALTER TABLE public.order_items
      ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255)
    `;

    const backfillOrderItemsVariantNameSql = `
      UPDATE public.order_items oi
      SET variant_name = COALESCE(oi.variant_name, miv.name)
      FROM public.menu_item_variants miv
      WHERE oi.menu_item_variant_id = miv.id
        AND (oi.variant_name IS NULL OR oi.variant_name = '')
    `;

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

    await executeSql(ensureOrderItemsItemNameSql);
    await executeSql(backfillOrderItemsItemNameSql);
    console.log('✓ Order item name column ensured');

    await executeSql(ensureOrderItemsVariantNameSql);
    await executeSql(backfillOrderItemsVariantNameSql);
    console.log('✓ Order variant name column ensured');

    console.log('✓ Database migrations completed successfully');

  } catch (error) {
    console.warn('Migration warning:', error instanceof Error ? error.message : error);
  }
}
