import express from 'express';
import { getAdminSiteSettings, getPublicSiteSettings, updateAdminSiteSettings } from '../controllers/siteSettingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { siteSettingsValidator } from '../validators/siteConfigurationValidators.js';

export const publicSiteSettingsRouter = express.Router();
const router = express.Router();

publicSiteSettingsRouter.get('/', getPublicSiteSettings);
router.use(protect, requirePermission('website.manage'));
router.get('/', getAdminSiteSettings);
router.put('/', siteSettingsValidator, validateRequest, updateAdminSiteSettings);

export default router;
