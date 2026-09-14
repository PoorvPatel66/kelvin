import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
const router = express.Router();
router.get('/', protect, requirePermission('analytics.read'), getActivityLogs);
export default router;
