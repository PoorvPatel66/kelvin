import express from 'express';
import {
  addInquiryNote,
  createBrochureDownloadInquiry,
  createContactInquiry,
  createInquiry,
  createNewsletterInquiry,
  createQuoteInquiry,
  createWhatsAppInquiry,
  exportInquiriesCsv,
  getInquiries,
  getInquiryById,
  getInquiryDashboard,
  resendInquiryNotification,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { inquiryRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  brochureDownloadValidator,
  createInquiryValidator,
  inquiryIdValidator,
  inquiryListValidator,
  inquiryNoteValidator,
  inquiryStatusValidator,
  newsletterValidator,
  requestQuoteValidator,
  whatsappCtaValidator
} from '../validators/inquiryValidators.js';

const router = express.Router();

router.post('/', inquiryRateLimiter, createInquiryValidator, validateRequest, createInquiry);
router.post('/contact', inquiryRateLimiter, createInquiryValidator, validateRequest, createContactInquiry);
router.post('/request-quote', inquiryRateLimiter, requestQuoteValidator, validateRequest, createQuoteInquiry);
router.post('/newsletter', inquiryRateLimiter, newsletterValidator, validateRequest, createNewsletterInquiry);
router.post('/brochure-download', inquiryRateLimiter, brochureDownloadValidator, validateRequest, createBrochureDownloadInquiry);
router.post('/whatsapp', inquiryRateLimiter, whatsappCtaValidator, validateRequest, createWhatsAppInquiry);

router.use(protect, requirePermission('sales.manage'));

router.get('/', inquiryListValidator, validateRequest, getInquiries);
router.get('/dashboard', getInquiryDashboard);
router.get('/export.csv', inquiryListValidator, validateRequest, exportInquiriesCsv);
router.get('/:id', inquiryIdValidator, validateRequest, getInquiryById);
router.patch('/:id/status', inquiryStatusValidator, validateRequest, updateInquiryStatus);
router.post('/:id/notes', inquiryNoteValidator, validateRequest, addInquiryNote);
router.post('/:id/resend-notification', inquiryIdValidator, validateRequest, resendInquiryNotification);

export default router;
