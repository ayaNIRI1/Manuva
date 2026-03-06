// Forcing environment to development to match logs
process.env.NODE_ENV = 'development';
// Mock environment variables if needed
process.env.FIREBASE_PROJECT_ID = 'manuva-e1bdb';
// (Others should be in .env)
require('dotenv').config();

const { verifyFirebaseToken } = require('./src/config/firebaseAdmin');

async function test() {
  console.log('--- Starting Token Verification Test ---');
  try {
    // Using a fake but realistic-ish token to trigger the verification path
    const fakeToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhMmIzYzRkNWU2Zjd...';
    console.log('Attempting to verify token...');
    await verifyFirebaseToken(fakeToken);
  } catch (err) {
    console.error('Verification failed as expected (due to fake token), but checking error type:');
    console.error('Error stack:', err.stack);
    console.error('Actual error message:', err.message);
    
    if (err.message.includes('jose')) {
      console.log('REPRODUCED: Found jose module error!');
    } else if (err.code && err.code.startsWith('auth/')) {
      console.log('SUCCESS: Firebase Auth handled the token (it just failed validation), module was found.');
    } else {
      console.log('UNDEFINED: Error occurred but not clearly a jose module issue.');
    }
  }
}

test();
