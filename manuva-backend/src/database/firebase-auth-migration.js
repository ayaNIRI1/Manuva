const { pool } = require('../config/database');

const runFirebaseAuthMigration = async () => {
  const client = await pool.connect();

  try {
    console.log('Running Firebase auth migration...');

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name = 'clerk_id'
        ) THEN
          UPDATE users
          SET firebase_uid = clerk_id
          WHERE firebase_uid IS NULL
            AND clerk_id IS NOT NULL;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid_unique
      ON users(firebase_uid)
      WHERE firebase_uid IS NOT NULL;
    `);

    console.log('Firebase auth migration completed.');
  } catch (error) {
    console.error('Firebase migration error:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

runFirebaseAuthMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
