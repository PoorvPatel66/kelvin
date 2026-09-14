import { body, param, query } from 'express-validator';

const phoneRule = /^[0-9+\-\s()]{7,20}$/;

export const createInquiryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('company').optional().trim(),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().trim().matches(phoneRule).withMessage('Valid phone number is required.'),
  body('country').optional().trim(),
  body('product').optional().trim(),
  body('message').optional().trim().isLength({ max: 3000 }),
  body('type')
    .optional()
    .isIn(['CONTACT', 'REQUEST_QUOTE', 'NEWSLETTER', 'BROCHURE_DOWNLOAD', 'WHATSAPP'])
    .withMessage('Invalid inquiry type.'),
  body('sourcePage').optional().trim(),
  body('brochureUrl').optional().isURL().withMessage('brochureUrl must be a valid URL.'),
  body('whatsappUrl').optional().isURL().withMessage('whatsappUrl must be a valid URL.')
];

export const requestQuoteValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('company').trim().notEmpty().withMessage('Company is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').trim().matches(phoneRule).withMessage('Valid phone number is required.'),
  body('country').trim().notEmpty().withMessage('Country is required.'),
  body('product').trim().notEmpty().withMessage('Product is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.')
];

export const newsletterValidator = [
  body('name').optional().trim(),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('sourcePage').optional().trim()
];

export const brochureDownloadValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('company').optional().trim(),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().trim().matches(phoneRule).withMessage('Valid phone number is required.'),
  body('country').optional().trim(),
  body('product').optional().trim(),
  body('brochureUrl').optional().isURL().withMessage('brochureUrl must be a valid URL.')
];

export const whatsappCtaValidator = [
  body('name').optional().trim(),
  body('email').optional().trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().trim().matches(phoneRule).withMessage('Valid phone number is required.'),
  body('country').optional().trim(),
  body('product').optional().trim(),
  body('sourcePage').optional().trim()
];

export const inquiryListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be 1 to 200.'),
  query('status').optional().isIn(['NEW', 'OPEN', 'REPLIED', 'CLOSED']),
  query('type').optional().isIn(['CONTACT', 'REQUEST_QUOTE', 'NEWSLETTER', 'BROCHURE_DOWNLOAD', 'WHATSAPP']),
  query('from').optional().isISO8601().withMessage('from must be a valid date.'),
  query('to').optional().isISO8601().withMessage('to must be a valid date.')
];

export const inquiryIdValidator = [
  param('id').isUUID().withMessage('Valid inquiry id is required.')
];

export const inquiryStatusValidator = [
  ...inquiryIdValidator,
  body('status').isIn(['NEW', 'OPEN', 'REPLIED', 'CLOSED']).withMessage('Invalid status.')
];

export const inquiryNoteValidator = [
  ...inquiryIdValidator,
  body('message').trim().notEmpty().withMessage('Note message is required.')
];
