import express from 'express';
import {
  createBrochureDownloadInquiry,
  createContactInquiry,
  createNewsletterInquiry,
  createQuoteInquiry,
  createWhatsAppInquiry
} from '../controllers/inquiryController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { inquiryRateLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  brochureDownloadValidator,
  createInquiryValidator,
  newsletterValidator,
  requestQuoteValidator,
  whatsappCtaValidator
} from '../validators/inquiryValidators.js';

const router = express.Router();

router.post('/', inquiryRateLimiter, createInquiryValidator, validateRequest, createContactInquiry);
router.post('/request-quote', inquiryRateLimiter, requestQuoteValidator, validateRequest, createQuoteInquiry);
router.post('/newsletter', inquiryRateLimiter, newsletterValidator, validateRequest, createNewsletterInquiry);
router.post('/brochure-download', inquiryRateLimiter, brochureDownloadValidator, validateRequest, createBrochureDownloadInquiry);
router.post('/whatsapp', inquiryRateLimiter, whatsappCtaValidator, validateRequest, createWhatsAppInquiry);

export default router;
