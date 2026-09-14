import { body, param, query } from 'express-validator';

const statuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];

export const testimonialListValidator = [
  query('status').optional().isIn(statuses).withMessage('Invalid testimonial status.'),
  query('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  query('q').optional().trim().isLength({ max: 120 }).withMessage('Search is too long.')
];

export const testimonialIdValidator = [
  param('id').isUUID().withMessage('Valid testimonial id is required.')
];

function testimonialBodyValidators(partial = false) {
  const name = body('name').trim();
  const quote = body('quote').trim();
  if (partial) {
    name.optional();
    quote.optional();
  }

  return [
  name.isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
  body('role').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('company').optional({ nullable: true }).trim().isLength({ max: 160 }),
  quote.isLength({ min: 10, max: 1200 }).withMessage('Quote must be between 10 and 1200 characters.'),
  body('sourceUrl').optional({ nullable: true, checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('avatarUrl').optional({ nullable: true, checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).toInt(),
  body('featured').optional().isBoolean().toBoolean(),
  body('status').optional().isIn(statuses).withMessage('Invalid testimonial status.'),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt()
  ];
}

export const createTestimonialValidator = testimonialBodyValidators();

export const updateTestimonialValidator = [
  ...testimonialIdValidator,
  ...testimonialBodyValidators(true)
];
