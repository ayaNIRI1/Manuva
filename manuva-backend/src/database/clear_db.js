const db = require('../config/database');

async function clearDatabase() {
    try {
        console.log('--- Starting Database Cleanup ---');

        // Order matters due to foreign key constraints
        const tablesToClear = [
            'reviews',
            'favorites',
            'follows',
            'order_items',
            'orders',
            'seller_subscriptions',
            'products',
            'users'
        ];

        for (const table of tablesToClear) {
            console.log(`Clearing table: ${table}...`);
            await db.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        }

        console.log('--- Database Cleanup Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error.message);
        process.exit(1);
    }
}

clearDatabase();
