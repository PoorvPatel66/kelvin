import { body, param, query } from 'express-validator';

const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pageStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const robotsOptions = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

export const publicPageValidator = [
  param('identifier')
    .trim()
    .matches(slugRule)
    .withMessage('Valid page key or slug is required.')
];

export const pageListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('status').optional().isIn(pageStatuses).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
  query('pageKey').optional().trim().isLength({ max: 80 }).withMessage('Page key is too long.')
];

export const pageIdValidator = [
  param('id').isUUID().withMessage('Valid page id is required.')
];

export const createPageValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Page title is required.')
    .isLength({ min: 2, max: 160 })
    .withMessage('Page title must be between 2 and 160 characters.'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Page slug is required.')
    .matches(slugRule)
    .withMessage('Invalid page slug format.'),
  body('pageKey').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('status').optional().isIn(pageStatuses).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
  body('excerpt').optional({ values: 'falsy' }).trim().isLength({ max: 320 }),
  body('content').optional({ values: 'falsy' }).trim(),
  body('sections')
    .optional()
    .custom((value) => {
      if (value === null) return true;
      if (typeof value === 'object' && value !== null) return true;
      throw new Error('Sections must be a valid JSON object or array.');
    }),
  body('seoTitle').optional({ values: 'falsy' }).trim().isLength({ max: 70 }),
  body('seoDescription').optional({ values: 'falsy' }).trim().isLength({ max: 170 }),
  body('seoKeywords').optional(),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL().withMessage('Canonical URL must be valid.'),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions).withMessage('Invalid robots directive.'),
  body('ogImage').optional({ values: 'falsy' }).isURL().withMessage('Open Graph image must be a valid URL.')
];

export const updatePageValidator = [
  ...pageIdValidator,
  body('title').optional().trim().isLength({ min: 2, max: 160 }),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid page slug format.'),
  body('pageKey').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('status').optional().isIn(pageStatuses).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
  body('excerpt').optional({ values: 'falsy' }).trim().isLength({ max: 320 }),
  body('content').optional({ values: 'falsy' }).trim(),
  body('sections')
    .optional()
    .custom((value) => {
      if (value === null) return true;
      if (typeof value === 'object' && value !== null) return true;
      throw new Error('Sections must be a valid JSON object or array.');
    }),
  body('seoTitle').optional({ values: 'falsy' }).trim().isLength({ max: 70 }),
  body('seoDescription').optional({ values: 'falsy' }).trim().isLength({ max: 170 }),
  body('seoKeywords').optional(),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL().withMessage('Canonical URL must be valid.'),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions).withMessage('Invalid robots directive.'),
  body('ogImage').optional({ values: 'falsy' }).isURL().withMessage('Open Graph image must be a valid URL.')
];

export const pageStatusValidator = [
  ...pageIdValidator,
  body('status').isIn(pageStatuses).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.')
];
