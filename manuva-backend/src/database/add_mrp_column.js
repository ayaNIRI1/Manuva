const { pool } = require('../config/database');

async function addMrpColumn() {
  const client = await pool.connect();
  try {
    console.log('Checking for mrp column in products table...');
    
    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'mrp'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding mrp column...');
      await client.query('ALTER TABLE products ADD COLUMN mrp DECIMAL(10,2) CHECK (mrp >= 0)');
      console.log('mrp column added successfully.');
    } else {
      console.log('mrp column already exists.');
    }

  } catch (error) {
    console.error('Error adding mrp column:', error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

addMrpColumn();
