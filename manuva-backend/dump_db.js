const db = require('./src/config/database');

async function dumpData() {
    try {
        const users = await db.query("SELECT id, email, name FROM users");
        console.log('--- USERS ---');
        console.log(users.rows);

        const products = await db.query("SELECT id, name, price, status FROM products");
        console.log('--- PRODUCTS ---');
        console.log(products.rows);

        const activeCarts = await db.query("SELECT * FROM orders WHERE status = '1'");
        console.log('--- ACTIVE CARTS (status 1) ---');
        console.log(activeCarts.rows);

        const orderItems = await db.query("SELECT * FROM order_items");
        console.log('--- ALL ORDER ITEMS ---');
        console.log(orderItems.rows);

    } catch (error) {
        console.error('Dump error:', error);
    } finally {
        process.exit();
    }
}

dumpData();
