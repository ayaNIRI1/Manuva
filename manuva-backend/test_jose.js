try {
  console.log('Attempting to require jose...');
  const jose = require('jose');
  console.log('Successfully required jose via name.');
} catch (e) {
  console.error('Failed to require jose via name:', e);
}

try {
  const path = require('path');
  const josePath = path.resolve(__dirname, 'node_modules', 'jose', 'dist', 'node', 'cjs', 'index.js');
  console.log('Attempting to require jose from path:', josePath);
  const joseDirect = require(josePath);
  console.log('Successfully required jose via direct path.');
} catch (e) {
  console.error('Failed to require jose via path:', e);
}
