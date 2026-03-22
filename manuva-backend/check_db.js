const db = require('./src/config/database');
(async () => {
    try {
        const res = await db.query('SELECT id, name, img, is_approved FROM categories ORDER BY created_at DESC LIMIT 10');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
