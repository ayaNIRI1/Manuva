const axios = require('axios');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zuslfmvqmafrillxfwts.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'product-images';

/**
 * Uploads a file buffer to Supabase Storage and returns the public URL.
 * @param {Object} file - The file object from Multer (memoryStorage) containing buffer, originalname, and mimetype.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
async function uploadToSupabase(file) {
  if (!file || !file.buffer) {
    throw new Error('No file buffer available for upload');
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables');
  }

  // Generate a unique filename using timestamp and a random suffix to prevent name collisions
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname) || '.png';
  const filename = `${uniqueSuffix}${ext}`;

  // Supabase Storage upload endpoint: POST /storage/v1/object/bucket/filename
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filename}`;

  try {
    console.log(`📤 Uploading ${file.originalname} to Supabase storage...`);
    const response = await axios.post(uploadUrl, file.buffer, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': file.mimetype || 'image/png'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log(`✅ Upload successful: ${response.data.Key || filename}`);

    // Return the public URL for retrieving the file
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
    return publicUrl;
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ Supabase storage upload error details:', errorDetails);
    throw new Error(`Failed to upload image to Supabase Storage: ${errorDetails}`);
  }
}

/**
 * Ensures the Supabase Storage bucket for product images exists and is public.
 */
async function ensureBucketExists() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Skipping storage bucket check.');
    return;
  }

  try {
    const listRes = await axios.get(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const bucketExists = listRes.data.some(b => b.id === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`📁 Bucket "${BUCKET_NAME}" not found. Creating it now...`);
      await axios.post(`${SUPABASE_URL}/storage/v1/bucket`, {
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      }, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`🎉 Supabase Storage bucket "${BUCKET_NAME}" created successfully and configured as public.`);
    } else {
      console.log(`✅ Supabase Storage bucket "${BUCKET_NAME}" exists.`);
    }
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`❌ Failed to ensure Supabase Storage bucket "${BUCKET_NAME}" exists:`, errorDetails);
  }
}

module.exports = { uploadToSupabase, ensureBucketExists };

