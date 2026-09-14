import { body, param, query } from 'express-validator';

const statuses = ['ACTIVE', 'INACTIVE', 'DRAFT'];

export const certificationListValidator = [
  query('status').optional().isIn(statuses).withMessage('Invalid certification status.'),
  query('q').optional().trim().isLength({ max: 160 }).withMessage('Search is too long.')
];

export const certificationIdValidator = [
  param('id').isUUID().withMessage('Valid certification id is required.')
];

function certificationBodyValidators(partial = false) {
  const title = body('title').trim();
  const description = body('description').trim();
  if (partial) {
    title.optional();
    description.optional();
  }

  return [
    title.isLength({ min: 2, max: 180 }).withMessage('Title must be between 2 and 180 characters.'),
    body('issuer').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 180 }),
    body('certificateNumber').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 160 }),
    description.isLength({ min: 5, max: 2000 }).withMessage('Description must be between 5 and 2000 characters.'),
    body('issueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Issue date must be valid.'),
    body('expiryDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Expiry date must be valid.')
      .custom((value, { req }) => {
        if (value && req.body.issueDate && new Date(value) < new Date(req.body.issueDate)) {
          throw new Error('Expiry date cannot be before the issue date.');
        }
        return true;
      }),
    body('icon')
      .optional({ nullable: true, checkFalsy: true })
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Image URL must be a valid HTTP or HTTPS URL.'),
    body('pdfUrl')
      .optional({ nullable: true, checkFalsy: true })
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('PDF URL must be a valid HTTP or HTTPS URL.'),
    body('status').optional().isIn(statuses).withMessage('Invalid certification status.'),
    body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt()
  ];
}

export const createCertificationValidator = certificationBodyValidators();

export const updateCertificationValidator = [
  ...certificationIdValidator,
  ...certificationBodyValidators(true)
];
