import multer from 'multer';
import AppError from '../utils/AppError.js';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const maxSize = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new AppError('Only JPG, JPEG, PNG, WEBP, and SVG images are allowed.', 400), false);
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize
  }
});

export const singleImageUpload = (fieldName = 'image') => upload.single(fieldName);
export const multipleImageUpload = (fieldName = 'images', maxCount = 10) =>
  upload.array(fieldName, maxCount);
