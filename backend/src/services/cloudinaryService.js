import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

function assertCloudinaryConfigured() {
  if (!(process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME)) {
    throw new AppError('Cloudinary is not configured.', 500);
  }
}

function getDataUri(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

export async function uploadBufferToCloudinary(file, folder = 'kelvin/uploads') {
  if (!file) {
    throw new AppError('Image file is required.', 400);
  }

  assertCloudinaryConfigured();

  let result;

  try {
    result = await cloudinary.uploader.upload(getDataUri(file), {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto'
    });
  } catch (error) {
    throw new AppError(`Cloudinary upload failed: ${error.message}`, 502);
  }

  return {
    publicId: result.public_id,
    url: result.secure_url,
    resourceType: result.resource_type,
    folder
  };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) {
    return null;
  }

  assertCloudinaryConfigured();

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });
  } catch (error) {
    throw new AppError(`Cloudinary delete failed: ${error.message}`, 502);
  }
}

export async function replaceCloudinaryImage(oldPublicId, file, folder) {
  const uploaded = await uploadBufferToCloudinary(file, folder);
  await deleteFromCloudinary(oldPublicId);
  return uploaded;
}

export function getImageTransformations(publicId) {
  return {
    thumbnail: cloudinary.url(publicId, {
      secure: true,
      width: 160,
      height: 160,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    card: cloudinary.url(publicId, {
      secure: true,
      width: 640,
      height: 480,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    large: cloudinary.url(publicId, {
      secure: true,
      width: 1400,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    })
  };
}
