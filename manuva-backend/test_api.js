const axios = require('axios');

async function testBackend() {
    try {
        console.log('Testing connection to http://localhost:3001/health...');
        const res = await axios.get('http://localhost:3001/health');
        console.log('Backend Health Check:', res.data);
        
        console.log('Testing connection to http://localhost:3001/api/auth/me (should fail with 401)...');
        try {
            await axios.get('http://localhost:3001/api/auth/me');
        } catch (err) {
            console.log('Auth Me Status:', err.response?.status, err.response?.data);
        }
    } catch (error) {
        console.error('Failed to connect to backend:', error.message);
    }
}

testBackend();
