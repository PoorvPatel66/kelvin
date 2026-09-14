import express from 'express';
import { body } from 'express-validator';
import { createBackup, deleteBackup, downloadBackup, getBackups } from '../controllers/backupController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uuidParam } from '../validators/adminOperationsValidators.js';

const router = express.Router();
router.use(protect, authorize('SUPER_ADMIN'));
router.get('/', getBackups);
router.post('/', body('label').optional().trim().isLength({ max: 160 }), validateRequest, createBackup);
router.get('/:id/download', uuidParam, validateRequest, downloadBackup);
router.delete('/:id', uuidParam, validateRequest, deleteBackup);
export default router;
