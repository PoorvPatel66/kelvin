import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect, requirePermission('dashboard.read'));

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const [products, blogs, inquiries, newInquiries] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.blog.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        products,
        blogs,
        inquiries,
        newInquiries
      }
    });
  })
);

export default router;
