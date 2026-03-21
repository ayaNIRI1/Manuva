const db = require('./src/config/database');
async function run() {
  try {
    const { rows } = await db.query('SELECT id, email, role FROM users');
    console.table(rows);
  } catch(e) { console.error(e); }
  process.exit(0);
}
run();
