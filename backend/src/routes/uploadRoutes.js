import express from 'express';
import { uploadSingle } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, requirePermission('website.manage'), upload.single('file'), uploadSingle);

export default router;
