const db = require('../config/database');

async function migrate() {
    try {
        console.log('Starting categories migration...');

        // 1. Add is_approved column
        await db.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
        `);
        console.log('Added is_approved column to categories table.');

        // 2. Delete old categories (this will trigger ON DELETE SET NULL on products.category_id)
        await db.query('DELETE FROM categories');
        console.log('Cleared out old categories.');

        // 3. Insert the 6 explicit core categories
        const newCategories = [
            ['🏺 Home Decor (ديكور المنزل)', 'أدوات وديكورات منزلية فريدة'],
            ['💍 Jewelry & Accessories (إكسسوارات)', 'مجوهرات وحلي وإكسسوارات'],
            ['👜 Bags & Fashion (حقائب وموضة)', 'أزياء وحقائب مصنوعة يدوياً'],
            ['🎁 Gifts & Custom Orders (هدايا مخصصة)', 'هدايا وتوزيعات وطلبات خاصة'],
            ['🧸 Kids & Toys (أطفال)', 'ألعاب وملابس وملحقات أطفال'],
            ['🎨 Art & Crafts (فن وأعمال فنية)', 'لوحات وفنون وأعمال يدوية متنوعة']
        ];

        for (const [name, desc] of newCategories) {
            await db.query(`
                INSERT INTO categories (name, description, is_approved) 
                VALUES ($1, $2, TRUE) 
                ON CONFLICT (name) DO NOTHING
            `, [name, desc]);
        }
        
        console.log('Successfully inserted the 6 approved core categories.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
