import express from 'express';
import {
  dashboardGlobalSearch,
  dashboardSummary,
  featuredProducts,
  latestInquiries,
  monthlyInquiryAnalytics,
  recentBlogs,
  visitorAnalytics
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.use(protect, requirePermission('dashboard.read'));

router.get('/summary', dashboardSummary);
router.get('/inquiries/monthly', monthlyInquiryAnalytics);
router.get('/inquiries/latest', latestInquiries);
router.get('/blogs/recent', recentBlogs);
router.get('/products/featured', featuredProducts);
router.get('/search', dashboardGlobalSearch);
router.get('/visitors', visitorAnalytics);

export default router;
