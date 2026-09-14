import express from 'express';
import { getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
const router = express.Router();
router.get('/', protect, requirePermission('analytics.read'), getAdminAnalytics);
export default router;
