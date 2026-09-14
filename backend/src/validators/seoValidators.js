import { body, param, query } from 'express-validator';

const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const types = ['PAGE', 'PRODUCT', 'BLOG'];
const robotsOptions = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

export const seoListValidator = [
  query('type').optional().toUpperCase().isIn(types).withMessage('Type must be PAGE, PRODUCT, or BLOG.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional({ values: 'falsy' }).trim().isLength({ max: 160 })
];

export const seoUpdateValidator = [
  param('type').toUpperCase().isIn(types).withMessage('Type must be PAGE, PRODUCT, or BLOG.'),
  param('id').isUUID().withMessage('Valid record id is required.'),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('seoTitle').optional({ values: 'falsy' }).trim().isLength({ max: 70 }),
  body('seoDescription').optional({ values: 'falsy' }).trim().isLength({ max: 170 }),
  body('seoKeywords').optional(),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL().withMessage('Canonical URL must be valid.'),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions).withMessage('Invalid robots directive.'),
  body('ogImage').optional({ values: 'falsy' }).isURL().withMessage('Open Graph image must be a valid URL.')
];
