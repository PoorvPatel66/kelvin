import express from 'express';
import {
  createProduct,
  bulkUpdateProducts,
  deleteProduct,
  duplicateProduct,
  getAdminProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  updateProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProductValidator,
  bulkProductValidator,
  productIdValidator,
  productListValidator,
  productSlugValidator,
  updateProductValidator
} from '../validators/productValidators.js';

const router = express.Router();

router.get('/', productListValidator, validateRequest, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', productSlugValidator, validateRequest, getProductBySlug);

export const adminProductRouter = express.Router();

adminProductRouter.use(protect, requirePermission('products.manage'));
adminProductRouter.get('/', productListValidator, validateRequest, getAdminProducts);
adminProductRouter.patch('/bulk', bulkProductValidator, validateRequest, bulkUpdateProducts);
adminProductRouter.post(
  '/',
  upload.array('images', 10),
  createProductValidator,
  validateRequest,
  createProduct
);
adminProductRouter.put(
  '/:id',
  upload.array('images', 10),
  updateProductValidator,
  validateRequest,
  updateProduct
);
adminProductRouter.delete('/:id', productIdValidator, validateRequest, deleteProduct);
adminProductRouter.post('/:id/restore', productIdValidator, validateRequest, restoreProduct);
adminProductRouter.post('/:id/duplicate', productIdValidator, validateRequest, duplicateProduct);
adminProductRouter.delete('/:id/permanent', productIdValidator, validateRequest, permanentlyDeleteProduct);

export default router;
