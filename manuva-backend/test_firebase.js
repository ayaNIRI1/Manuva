try {
  console.log('Attempting to require firebase-admin...');
  const admin = require('firebase-admin');
  console.log('Successfully required firebase-admin.');
  
  // Try to use a part of it that might trigger jose loading
  console.log('Testing jose through firebase-admin logic...');
  // This is a minimal test of its internals if possible
  const auth = admin.auth;
  console.log('auth accessible.');
} catch (e) {
  console.error('Failed to require or use firebase-admin:', e);
}
