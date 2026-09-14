import express from 'express';
import {
  createAdminPage,
  deleteAdminPage,
  draftAdminPage,
  getPublishedPage,
  getAdminPageById,
  getAdminPages,
  publishAdminPage,
  updateAdminPage,
  updateAdminPageStatus
} from '../controllers/pageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createPageValidator,
  pageIdValidator,
  pageListValidator,
  publicPageValidator,
  pageStatusValidator,
  updatePageValidator
} from '../validators/pageValidators.js';

const router = express.Router();
export const publicPageRouter = express.Router();

publicPageRouter.get('/:identifier', publicPageValidator, validateRequest, getPublishedPage);

router.use(protect, requirePermission('website.manage'));

router.get('/', pageListValidator, validateRequest, getAdminPages);
router.post('/', createPageValidator, validateRequest, createAdminPage);
router.get('/:id', pageIdValidator, validateRequest, getAdminPageById);
router.put('/:id', updatePageValidator, validateRequest, updateAdminPage);
router.delete('/:id', pageIdValidator, validateRequest, deleteAdminPage);
router.patch('/:id/status', pageStatusValidator, validateRequest, updateAdminPageStatus);
router.patch('/:id/publish', pageIdValidator, validateRequest, publishAdminPage);
router.patch('/:id/draft', pageIdValidator, validateRequest, draftAdminPage);

export default router;
