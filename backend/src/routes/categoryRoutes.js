import express from 'express';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  permanentlyDeleteCategory,
  restoreCategory,
  updateCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  categoryIdValidator,
  categoryListValidator,
  createCategoryValidator,
  updateCategoryValidator
} from '../validators/categoryValidators.js';

const router = express.Router();

router.get('/', categoryListValidator, validateRequest, getCategories);

export const adminCategoryRouter = express.Router();

adminCategoryRouter.use(protect, requirePermission('products.manage'));
adminCategoryRouter.get('/', categoryListValidator, validateRequest, getAdminCategories);
adminCategoryRouter.post('/', createCategoryValidator, validateRequest, createCategory);
adminCategoryRouter.put('/:id', updateCategoryValidator, validateRequest, updateCategory);
adminCategoryRouter.post('/:id/restore', categoryIdValidator, validateRequest, restoreCategory);
adminCategoryRouter.delete('/:id/permanent', categoryIdValidator, validateRequest, permanentlyDeleteCategory);
adminCategoryRouter.delete('/:id', categoryIdValidator, validateRequest, deleteCategory);

export default router;
