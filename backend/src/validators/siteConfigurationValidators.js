import { body, param } from 'express-validator';

const areas = ['HEADER', 'FOOTER_QUICK', 'FOOTER_MORE', 'FOOTER_SERVICES'];
const optionalText = (field, max = 500) => body(field).optional({ nullable: true }).trim().isLength({ max });

export const siteSettingsValidator = [
  body('siteName').optional().trim().isLength({ min: 1, max: 120 }),
  body('tagline').optional().trim().isLength({ min: 1, max: 180 }), optionalText('logoUrl', 500),
  optionalText('footerDescription', 700), optionalText('primaryPhone', 40), optionalText('alternatePhone', 40),
  optionalText('primaryEmail', 160), optionalText('alternateEmail', 160), optionalText('websiteUrl', 500),
  optionalText('whatsappNumber', 40), optionalText('headOffice', 700), optionalText('corporateOffice', 700),
  optionalText('businessHours', 180),
  body('socialLinks').optional().isObject().withMessage('Social links must be an object.')
];

export const navigationIdValidator = [param('id').isUUID().withMessage('Valid navigation id is required.')];
export const navigationItemValidator = [
  body('label').trim().isLength({ min: 1, max: 80 }),
  body('path').trim().isLength({ min: 1, max: 500 }),
  body('area').isIn(areas),
  body('sortOrder').optional().isInt({ min: 0, max: 1000 }).toInt(),
  body('isVisible').optional().isBoolean().toBoolean(),
  body('isExternal').optional().isBoolean().toBoolean()
];

export const updateNavigationItemValidator = [
  ...navigationIdValidator,
  body('label').optional().trim().isLength({ min: 1, max: 80 }),
  body('path').optional().trim().isLength({ min: 1, max: 500 }),
  body('area').optional().isIn(areas),
  body('sortOrder').optional().isInt({ min: 0, max: 1000 }).toInt(),
  body('isVisible').optional().isBoolean().toBoolean(),
  body('isExternal').optional().isBoolean().toBoolean()
];
