const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('--- Emergency Seeding Started ---');

    // 1. Create Artisan User
    const artisanId = 'fdbb32ab-1636-4e9a-9edb-4a461c6035cf';
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await client.query(`
      INSERT INTO users (id, name, email, password, role, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, true, true)
      ON CONFLICT (id) DO NOTHING
    `, [artisanId, 'Test Artisan', 'artisan@test.com', hashedPassword, 'artisan']);
    console.log('Artisan user ensured.');

    // 2. Map Categories
    const catResult = await client.query('SELECT id, name FROM categories');
    if (catResult.rows.length === 0) {
      console.log('No categories found! Run npm run init-db first.');
      return;
    }
    
    const categories = {};
    catResult.rows.forEach(c => categories[c.name] = c.id);
    
    // Helper to get category ID by name (handling specific names from schema.sql)
    const getCat = (nameChunk) => {
      const entry = Object.entries(categories).find(([name]) => name.includes(nameChunk));
      return entry ? entry[1] : catResult.rows[0].id;
    };

    const potCat = getCat('الفخار');
    const carpetCat = getCat('المنسوجات'); // Using textiles for carpet in this mockup

    // 3. Insert Products (matching those in seed_products.sql and frontend)
    const products = [
      { id: '5a2fcf2f-36f4-4ffd-84de-052161effe18', name: 'Traditional Copper Pot', price: 6500, cat: potCat },
      { id: '814e8711-97e3-471a-a1db-e84bb266a6d5', name: 'Ceramic Vase', price: 3800, cat: potCat },
      { id: 'c03bd0da-b04e-48ae-b776-86d07e024623', name: 'Berber Carpet', price: 22000, cat: carpetCat },
      { id: '11111111-1111-4111-8111-111111111114', name: 'Leather Bag', price: 9500, cat: getCat('الجلدية') },
      { id: '11111111-1111-4111-8111-111111111115', name: 'Decorative Plate', price: 2800, cat: potCat }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (id, seller_id, category_id, name, price, stock, status)
        VALUES ($1, $2, $3, $4, $5, 100, 'approved')
        ON CONFLICT (id) DO UPDATE SET 
          status = 'approved', 
          price = EXCLUDED.price, 
          stock = 100
      `, [p.id, artisanId, p.cat, p.name, p.price]);
      console.log(`Product ensured: ${p.name} (${p.id})`);
    }

    console.log('--- Emergency Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
