import express from 'express';
import { createVariant, deleteVariant, getVariants, updateVariant } from '../controllers/variantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { listValidator, uuidParam, variantCreateValidator } from '../validators/adminOperationsValidators.js';

const router = express.Router();
router.use(protect, requirePermission('products.manage'));
router.get('/', listValidator, validateRequest, getVariants);
router.post('/', variantCreateValidator, validateRequest, createVariant);
router.put('/:id', [...uuidParam, ...variantCreateValidator], validateRequest, updateVariant);
router.delete('/:id', uuidParam, validateRequest, deleteVariant);

export default router;
