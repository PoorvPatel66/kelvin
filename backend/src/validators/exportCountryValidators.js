import { body, param, query } from 'express-validator';

const statuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];

export const exportCountryListValidator = [
  query('status').optional().isIn(statuses).withMessage('Invalid export market status.'),
  query('q').optional().trim().isLength({ max: 120 }).withMessage('Search is too long.')
];

export const exportCountryIdValidator = [
  param('id').isUUID().withMessage('Valid export market id is required.')
];

function exportCountryBodyValidators(partial = false) {
  const countryName = body('countryName').trim();
  if (partial) countryName.optional();

  return [
    countryName.isLength({ min: 2, max: 120 }).withMessage('Country name must be between 2 and 120 characters.'),
    body('flagUrl')
      .optional({ nullable: true, checkFalsy: true })
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Flag URL must be a valid HTTP or HTTPS URL.'),
    body('flagPublicId').optional({ nullable: true }).trim().isLength({ max: 255 }),
    body('status').optional().isIn(statuses).withMessage('Invalid export market status.')
  ];
}

export const createExportCountryValidator = exportCountryBodyValidators();

export const updateExportCountryValidator = [
  ...exportCountryIdValidator,
  ...exportCountryBodyValidators(true)
];
