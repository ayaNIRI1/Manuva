const multer = require('multer');

// Store files in memory buffer instead of disk to allow uploading to Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;

