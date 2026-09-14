import express from 'express';
import { getSeoRecords, getSeoSummary, updateSeoRecord } from '../controllers/seoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { seoListValidator, seoUpdateValidator } from '../validators/seoValidators.js';

const router = express.Router();

router.use(protect, requirePermission('website.manage'));
router.get('/summary', getSeoSummary);
router.get('/', seoListValidator, validateRequest, getSeoRecords);
router.put('/:type/:id', seoUpdateValidator, validateRequest, updateSeoRecord);

export default router;
