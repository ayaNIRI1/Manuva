const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const client = await pool.connect();
  try {
    console.log('Seeding admin user...');
    const email = 'admin@manuva.com';
    const password = 'admin'; // simple password for local dev
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = 'Admin User';
    const role = 'admin';

    await client.query(
      `INSERT INTO users (name, email, password, role, is_active, is_verified) 
       VALUES ($1, $2, $3, $4, true, true)
       ON CONFLICT (email) DO UPDATE 
       SET password = EXCLUDED.password, role = EXCLUDED.role, is_active = true`,
      [name, email, hashedPassword, role]
    );
    console.log(`Admin seeded! Email: ${email}, Password: ${password}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedAdmin();
