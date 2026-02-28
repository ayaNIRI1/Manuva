const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log(' Manuva Database Initialization');
  

    // Check if tables already exist
    const tablesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tablesCheck.rows.length > 0) {
      console.log('⚠️  Database tables already exist!');
      console.log('   Run this to verify current state:');
      console.log('   npm run check-db\n');
      
      // Show existing tables
      const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log(' Existing tables:');
      tables.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));
      
      console.log('\n Tip: To recreate database, run:');
      console.log('   DROP DATABASE "manuva_v"; CREATE DATABASE "manuva_v";');
      console.log('   Then run: npm run init-db\n');
      
      return;
    }

    console.log(' Reading database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('schema.sql file not found!');
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(' Schema file loaded\n');

    console.log(' Creating database structure...');
    await client.query(schema);
    console.log(' Database structure created\n');

    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(' Database initialized successfully!\n');
    console.log('Created tables:');
    tables.rows.forEach(row => console.log(`    ${row.table_name}`));

    // Show summary
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    const planCount = await client.query('SELECT COUNT(*) FROM subscription_plans');
    
    console.log('\n Default data:');
    console.log(`    ${categoryCount.rows[0].count} categories`);
    console.log(`    ${planCount.rows[0].count} subscription plans`);
    
    console.log(' Database is ready to use!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test API: http://localhost:3000/health');
    console.log('   3. Check categories: http://localhost:3000/api/categories\n');
    
  } catch (error) {
    console.error('\n Database initialization error:');
    console.error(error.message);
    console.error('\n Common issues:');
    console.error('   - PostgreSQL not running');
    console.error('   - Wrong database credentials in .env');
    console.error('   - Database "manuva_v" doesn\'t exist');
    console.error('\n To create database:');
    console.error('   psql -U postgres');
    console.error('   CREATE DATABASE "manuva_v";');
    console.error('   \\q\n');
    throw error;
  } finally {
    client.release();
  }
};

const checkDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log(' Checking database status...\n');

    // Check tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('  No tables found! Run: npm run init-db\n');
      return;
    }

    console.log(' Database tables:');
    tables.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

    // Show data counts
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM categories'),
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM orders'),
      client.query('SELECT COUNT(*) FROM subscription_plans')
    ]);

    console.log('\n Data summary:');
    console.log(`   Users: ${counts[0].rows[0].count}`);
    console.log(`   Categories: ${counts[1].rows[0].count}`);
    console.log(`   Products: ${counts[2].rows[0].count}`);
    console.log(`   Orders: ${counts[3].rows[0].count}`);
    console.log(`   Subscription Plans: ${counts[4].rows[0].count}`);

    console.log('\n Database is healthy!\n');
    
  } catch (error) {
    console.error(' Database check error:', error.message, '\n');
    throw error;
  } finally {
    client.release();
  }
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkDatabase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Failed:', error.message);
        process.exit(1);
      });
  } else {
    initDatabase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { initDatabase, checkDatabase };
