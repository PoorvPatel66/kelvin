import express from 'express';
import { body } from 'express-validator';
import {
  createQuotation,
  deleteQuotation,
  downloadQuotationPdf,
  getQuotationById,
  getQuotations,
  updateQuotation,
  updateQuotationStatus
} from '../controllers/quotationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { listValidator, uuidParam } from '../validators/adminOperationsValidators.js';

const router = express.Router();
const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
const quotationBody = [
  body('customerId').isUUID(),
  body('inquiryId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('status').optional().isIn(statuses),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('discountAmount').optional().isFloat({ min: 0 }),
  body('items').isArray({ min: 1 }),
  body('items.*.name').trim().isLength({ min: 1, max: 180 }),
  body('items.*.quantity').isFloat({ gt: 0 }),
  body('items.*.unitPrice').isFloat({ min: 0 })
];

router.use(protect, requirePermission('sales.manage'));
router.get('/', listValidator, validateRequest, getQuotations);
router.post('/', quotationBody, validateRequest, createQuotation);
router.get('/:id', uuidParam, validateRequest, getQuotationById);
router.get('/:id/pdf', uuidParam, validateRequest, downloadQuotationPdf);
router.put('/:id', [...uuidParam, ...quotationBody], validateRequest, updateQuotation);
router.patch('/:id/status', [...uuidParam, body('status').isIn(statuses)], validateRequest, updateQuotationStatus);
router.delete('/:id', uuidParam, validateRequest, deleteQuotation);

export default router;
