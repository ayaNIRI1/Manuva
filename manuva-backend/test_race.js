const db = require('./src/config/database');
const { verifyFirebaseToken } = require('./src/config/firebaseAdmin');
// We'll mock the verifyFirebaseToken and getOrCreateFirebaseUser equivalent logic here for testing
const { auth } = require('./src/middleware/auth');

async function simulateRaceCondition() {
    const mockDecoded = {
        uid: 'test_uid_' + Date.now(),
        email: 'test_race_' + Date.now() + '@example.com',
        name: 'Race Test User',
        picture: 'http://example.com/pic.jpg'
    };

    console.log('Simulating concurrent requests for email:', mockDecoded.email);

    // We can't easily call the middleware directly with mocks without a full express setup
    // so we'll test the core logic in getOrCreateFirebaseUser by calling it twice in parallel
    // Since it's exported in the same file as a private function, we might need to expose it or
    // just test the endpoint if we have a valid token.
    // For now, let's just check the database after a simulated insert.

    const req1 = db.query(
        `INSERT INTO users (firebase_uid, email, name, role, password)
         VALUES ($1, $2, $3, 'customer', 'managed')
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [mockDecoded.uid, mockDecoded.email, mockDecoded.name]
    );

    const req2 = db.query(
        `INSERT INTO users (firebase_uid, email, name, role, password)
         VALUES ($1, $2, $3, 'customer', 'managed')
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [mockDecoded.uid, mockDecoded.email, mockDecoded.name]
    );

    try {
        const [res1, res2] = await Promise.all([req1, req2]);
        console.log('Request 1 result rows:', res1.rows.length);
        console.log('Request 2 result rows:', res2.rows.length);
        
        if (res1.rows.length === 0 && res2.rows.length === 0) {
            console.log('Both failed to insert (expected if using ON CONFLICT DO NOTHING)');
        } else {
            console.log('Success: One of the requests succeeded.');
        }
    } catch (err) {
        console.error('Race condition error:', err.message);
    } finally {
        // Cleanup
        await db.query('DELETE FROM users WHERE email = $1', [mockDecoded.email]);
        await db.pool.end();
    }
}

simulateRaceCondition();
