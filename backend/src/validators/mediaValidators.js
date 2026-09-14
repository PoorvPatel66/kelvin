import { body, param } from 'express-validator';

export const productUploadValidator = [
  body('productId').isUUID().withMessage('Valid productId is required.')
];

export const blogUploadValidator = [
  body('blogId').isUUID().withMessage('Valid blogId is required.'),
  body('imageType')
    .isIn(['thumbnail', 'cover'])
    .withMessage('imageType must be thumbnail or cover.')
];

export const blogImageDeleteValidator = [
  param('id').isUUID().withMessage('Valid blog id is required.'),
  param('imageType')
    .isIn(['thumbnail', 'cover'])
    .withMessage('imageType must be thumbnail or cover.')
];

export const countryFlagUploadValidator = [
  param('id').isUUID().withMessage('Valid country id is required.')
];

export const certificateIconUploadValidator = [
  param('id').isUUID().withMessage('Valid certification id is required.')
];

export const mediaAssetUploadValidator = [
  body('type')
    .isIn(['HERO_BANNER', 'ABOUT_IMAGE', 'DOWNLOAD'])
    .withMessage('type must be HERO_BANNER, ABOUT_IMAGE, or DOWNLOAD.'),
  body('title').optional().trim().isLength({ max: 160 }),
  body('alt').optional().trim().isLength({ max: 220 })
];

export const productImageIdValidator = [
  param('id').isUUID().withMessage('Valid product image id is required.')
];

export const mediaAssetIdValidator = [
  param('id').isUUID().withMessage('Valid media asset id is required.')
];
