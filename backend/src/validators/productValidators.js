import { body, param, query } from 'express-validator';

const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const robotsOptions = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

const seoValidators = [
  body('seoTitle').optional({ values: 'falsy' }).trim().isLength({ max: 70 }),
  body('seoDescription').optional({ values: 'falsy' }).trim().isLength({ max: 170 }),
  body('seoKeywords').optional(),
  body('canonicalUrl').optional({ values: 'falsy' }).isURL().withMessage('Canonical URL must be valid.'),
  body('metaRobots').optional({ values: 'falsy' }).isIn(robotsOptions).withMessage('Invalid robots directive.'),
  body('ogImage').optional({ values: 'falsy' }).isURL().withMessage('Open Graph image must be a valid URL.')
];

export const productListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.'),
  query('trash').optional().isBoolean().withMessage('Trash must be true or false.')
];

export const bulkProductValidator = [
  body('ids').isArray({ min: 1, max: 100 }).withMessage('Select between 1 and 100 products.'),
  body('ids.*').isUUID().withMessage('Every product id must be valid.'),
  body('action').isIn(['delete', 'restore', 'status', 'featured', 'permanent-delete']),
  body('status')
    .if(body('action').equals('status'))
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('A valid status is required.'),
  body('featured')
    .if(body('action').equals('featured'))
    .isBoolean()
    .withMessage('Featured must be true or false.')
];

export const productSlugValidator = [
  param('slug').matches(slugRule).withMessage('Invalid product slug.')
];

export const productIdValidator = [
  param('id').isUUID().withMessage('Valid product id is required.')
];

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ min: 2, max: 160 })
    .withMessage('Product name must be between 2 and 160 characters.'),
  body('slug')
    .trim()
    .matches(slugRule)
    .withMessage('Slug must be lowercase and hyphen-separated.'),
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required.')
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('categoryId').isUUID().withMessage('Valid category is required.'),
  body('moq').trim().notEmpty().withMessage('MOQ is required.'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  ...seoValidators
];

export const updateProductValidator = [
  ...productIdValidator,
  body('name').optional().trim().isLength({ min: 2, max: 160 }),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('shortDescription').optional().trim().isLength({ max: 300 }),
  body('categoryId').optional().isUUID().withMessage('Valid category is required.'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  ...seoValidators
];
