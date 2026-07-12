import multer from 'multer';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from './profile.constants.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file type. Only JPG, JPEG, PNG, and WEBP images are allowed.');
    error.status = 400;
    cb(error, false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
}).single('avatar');
