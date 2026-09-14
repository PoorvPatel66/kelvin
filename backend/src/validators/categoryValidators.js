import { body, param, query } from 'express-validator';

const slugRule = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryListValidator = [
  query('trash').optional().isBoolean().withMessage('trash must be true or false.'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.')
];

export const categoryIdValidator = [
  param('id').isUUID().withMessage('Valid category id is required.')
];

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ min: 2, max: 120 })
    .withMessage('Category name must be between 2 and 120 characters.'),
  body('slug')
    .trim()
    .matches(slugRule)
    .withMessage('Slug must be lowercase and hyphen-separated.'),
  body('description').optional().trim(),
  body('imageUrl').optional({ values: 'falsy' }).isURL().withMessage('Image URL must be valid.'),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).withMessage('Sort order must be a positive integer.'),
  body('parentId').optional({ values: 'falsy' }).isUUID().withMessage('Parent category id must be valid.'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.')
];

export const updateCategoryValidator = [
  ...categoryIdValidator,
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('slug').optional().trim().matches(slugRule).withMessage('Invalid slug format.'),
  body('description').optional().trim(),
  body('imageUrl').optional({ values: 'falsy' }).isURL().withMessage('Image URL must be valid.'),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).withMessage('Sort order must be a positive integer.'),
  body('parentId').optional({ values: 'falsy' }).isUUID().withMessage('Parent category id must be valid.'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('Status must be ACTIVE, INACTIVE, or DRAFT.')
];
