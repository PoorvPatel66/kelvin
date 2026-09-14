import express from 'express';
import { createNavigationItem, deleteNavigationItem, getAdminNavigation, getPublicNavigation, updateNavigationItem } from '../controllers/navigationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { navigationIdValidator, navigationItemValidator, updateNavigationItemValidator } from '../validators/siteConfigurationValidators.js';

export const publicNavigationRouter = express.Router();
const router = express.Router();

publicNavigationRouter.get('/', getPublicNavigation);
router.use(protect, requirePermission('website.manage'));
router.get('/', getAdminNavigation);
router.post('/', navigationItemValidator, validateRequest, createNavigationItem);
router.put('/:id', updateNavigationItemValidator, validateRequest, updateNavigationItem);
router.delete('/:id', navigationIdValidator, validateRequest, deleteNavigationItem);

export default router;
