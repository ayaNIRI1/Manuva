const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Seeding test users...');
    
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const users = [
      {
        name: 'Buyer User',
        email: 'buyer@example.com',
        password: hashedPassword,
        role: 'customer',
        bio: 'I am a regular buyer'
      },
      {
        name: 'Artisan Seller',
        email: 'seller@example.com',
        password: hashedPassword,
        role: 'artisan',
        bio: 'I make beautiful handmade pottery',
        location: 'Marrakech'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        bio: 'System Administrator'
      }
    ];

    for (const user of users) {
      await client.query(`
        INSERT INTO users (name, email, password, role, bio, location, is_active, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true, true)
        ON CONFLICT (email) DO NOTHING
      `, [user.name, user.email, user.password, user.role, user.bio, user.location || null]);
      console.log(`User created or already exists: ${user.email}`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('Test Credentials:');
    console.log('Email: buyer@example.com  | Password: password123');
    console.log('Email: seller@example.com | Password: password123');
    console.log('Email: admin@example.com  | Password: password123');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
};

seedUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
