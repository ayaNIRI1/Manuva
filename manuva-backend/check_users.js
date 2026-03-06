const db = require('./src/config/database');

async function checkUsers() {
    try {
        const result = await db.query('SELECT id, email, name, firebase_uid FROM users');
        console.log('Total users:', result.rows.length);
        result.rows.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Firebase UID: ${user.firebase_uid}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error.message);
        process.exit(1);
    }
}

checkUsers();
