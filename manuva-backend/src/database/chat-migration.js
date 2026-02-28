const { pool } = require('../config/database');

const runChatMigration = async () => {
  const client = await pool.connect();

  try {
    console.log('Running chat tables migration...');

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS conversations (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seller_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(buyer_id, seller_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content          TEXT NOT NULL,
        is_read          BOOLEAN DEFAULT FALSE,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id   ON conversations(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_seller_id  ON conversations(seller_id);
    `);

    console.log('✅ Chat tables created successfully!');
  } catch (error) {
    console.error('❌ Chat migration error:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

runChatMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
