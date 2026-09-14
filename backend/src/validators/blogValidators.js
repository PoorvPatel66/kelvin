import { body, param, query } from 'express-validator';

const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const robotsOptions = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

export const blogListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
    .withMessage('Status must be DRAFT, PUBLISHED, ARCHIVED, or SCHEDULED.'),
  query('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  query('trash').optional().isBoolean().withMessage('Trash must be true or false.')
];

export const blogSlugValidator = [
  param('slug').matches(slugRule).withMessage('Invalid blog slug.')
];

export const blogIdValidator = [
  param('id').isUUID().withMessage('Valid blog id is required.')
];

export const createBlogValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ min: 3, max: 180 })
    .withMessage('Title must be between 3 and 180 characters.'),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required.')
    .isLength({ max: 320 })
    .withMessage('Excerpt cannot exceed 320 characters.'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
  body('contentFormat')
    .optional()
    .isIn(['MARKDOWN', 'RICH_TEXT'])
    .withMessage('Content format must be MARKDOWN or RICH_TEXT.'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
    .withMessage('Status must be DRAFT, PUBLISHED, ARCHIVED, or SCHEDULED.'),
  body('scheduledAt').optional({ values: 'falsy' }).isISO8601().withMessage('Schedule date must be valid.'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  body('categoryId').optional().isUUID().withMessage('Valid blog category id is required.'),
  body('seoTitle').optional().trim().isLength({ max: 70 }).withMessage('SEO title max is 70 characters.'),
  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 170 })
    .withMessage('SEO description max is 170 characters.'),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL().withMessage('Canonical URL must be valid.'),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions).withMessage('Invalid robots directive.'),
  body('ogImage').optional({ values: 'falsy' }).isURL().withMessage('Open Graph image must be a valid URL.')
];

export const updateBlogValidator = [
  ...blogIdValidator,
  body('title').optional().trim().isLength({ min: 3, max: 180 }),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('excerpt').optional().trim().isLength({ max: 320 }),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty.'),
  body('contentFormat').optional().isIn(['MARKDOWN', 'RICH_TEXT']),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']),
  body('scheduledAt').optional({ values: 'falsy' }).isISO8601(),
  body('featured').optional().isBoolean(),
  body('categoryId').optional().isUUID(),
  body('seoTitle').optional().trim().isLength({ max: 70 }),
  body('seoDescription').optional().trim().isLength({ max: 170 }),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL(),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions),
  body('ogImage').optional({ values: 'falsy' }).isURL()
];

export const blogStatusValidator = [
  ...blogIdValidator,
  body('status')
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
    .withMessage('Status must be DRAFT, PUBLISHED, ARCHIVED, or SCHEDULED.'),
  body('scheduledAt').optional({ values: 'falsy' }).isISO8601().withMessage('Schedule date must be valid.')
];

export const relatedArticlesValidator = [
  ...blogIdValidator,
  body('relatedIds')
    .isArray({ max: 12 })
    .withMessage('relatedIds must be an array with at most 12 items.'),
  body('relatedIds.*').isUUID().withMessage('Each related article id must be valid.')
];

export const blogCategoryIdValidator = [
  param('id').isUUID().withMessage('Valid blog category id is required.')
];

export const createBlogCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required.'),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('description').optional().trim(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
];

export const updateBlogCategoryValidator = [
  ...blogCategoryIdValidator,
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('description').optional().trim(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
];
