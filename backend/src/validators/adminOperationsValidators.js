import { body, param, query } from 'express-validator';

export const uuidParam = [param('id').isUUID().withMessage('A valid id is required.')];
export const listValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 160 })
];

export const variantCreateValidator = [
  body('productId').isUUID().withMessage('A valid product is required.'),
  body('name').trim().isLength({ min: 2, max: 140 }),
  body('sku').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 80 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DRAFT']),
  body('sortOrder').optional().isInt({ min: 0 })
];
export const catalogCreateValidator = [
  body('title').trim().isLength({ min: 2, max: 180 }),
  body('fileUrl').isURL({ require_protocol: false }).withMessage('A valid catalog file URL is required.'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  body('featured').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 })
];
