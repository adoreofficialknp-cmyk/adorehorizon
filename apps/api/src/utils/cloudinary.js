import { v2 as cloudinary } from 'cloudinary';

// ── Validate env vars immediately — fail loudly in production ──────────────
const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME  || process.env.CLOUDINARY_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY     || process.env.CLOUDINARY_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET  || process.env.CLOUDINARY_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  const missing = [
    !CLOUD_NAME  && 'CLOUDINARY_CLOUD_NAME',
    !API_KEY     && 'CLOUDINARY_API_KEY',
    !API_SECRET  && 'CLOUDINARY_API_SECRET',
  ].filter(Boolean).join(', ');
  console.error(`[Cloudinary] ❌ Missing env vars: ${missing}`);
  if (process.env.NODE_ENV === 'production') {
    // Warn but don't crash — uploads will fail gracefully per-request
    console.error('[Cloudinary] ⚠️  Image uploads will fail until these are set in Render env.');
  }
}

// ── Configure ──────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key:    API_KEY,
  api_secret: API_SECRET,
  secure:     true,          // always use https:// URLs
});

console.log(`[Cloudinary] ✅ Configured — cloud: ${CLOUD_NAME || '(missing)'}`);

// ── Upload helper ──────────────────────────────────────────────────────────
/**
 * Upload a file Buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {{ folder?: string, resourceType?: string, quality?: string, fetchFormat?: string }} options
 * @returns {Promise<{ url, publicId, width, height, format, bytes, resourceType }>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return Promise.reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in Render environment variables.'));
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder:        options.folder        || 'adore-jewellery',
      resource_type: options.resourceType  || 'auto',
      quality:       options.quality       || 'auto:best',
      fetch_format:  options.fetchFormat   || 'auto',
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('[Cloudinary] Upload error:', error.message);
        return reject(new Error(`Upload failed: ${error.message}`));
      }
      console.log(`[Cloudinary] ✅ Uploaded: ${result.public_id}`);
      resolve({
        url:          result.secure_url,
        publicId:     result.public_id,
        width:        result.width,
        height:       result.height,
        format:       result.format,
        bytes:        result.bytes,
        resourceType: result.resource_type,
      });
    });

    stream.end(buffer);
  });
};

// ── Delete helper ──────────────────────────────────────────────────────────
/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 * @param {'image'|'video'|'raw'} resourceType
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] 🗑️  Deleted: ${publicId} — ${result.result}`);
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Delete error (${publicId}):`, error.message);
    throw error;
  }
};

export default cloudinary;
