import { body, param, query } from 'express-validator';

const statuses = ['LEAD', 'ACTIVE', 'INACTIVE', 'BLOCKED'];
const sources = ['CONTACT', 'REQUEST_QUOTE', 'NEWSLETTER', 'BROCHURE_DOWNLOAD', 'WHATSAPP', 'MANUAL'];

export const customerListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().trim().isLength({ max: 160 }).withMessage('Search is too long.'),
  query('status').optional().isIn(statuses).withMessage('Invalid customer status.'),
  query('source').optional().isIn(sources).withMessage('Invalid customer source.'),
  query('country').optional().trim().isLength({ max: 120 }).withMessage('Country filter is too long.')
];

export const customerIdValidator = [param('id').isUUID().withMessage('Valid customer id is required.')];

function customerBodyValidators(partial = false) {
  const name = body('name').trim();
  const email = body('email').trim().toLowerCase();
  if (partial) {
    name.optional();
    email.optional();
  }

  return [
    name.isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
    email.isEmail().withMessage('A valid email is required.'),
    body('company').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 160 }),
    body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 7, max: 30 }),
    body('country').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }),
    body('status').optional().isIn(statuses).withMessage('Invalid customer status.'),
    body('source').optional().isIn(sources).withMessage('Invalid customer source.')
  ];
}

export const createCustomerValidator = customerBodyValidators();
export const updateCustomerValidator = [...customerIdValidator, ...customerBodyValidators(true)];
export const customerNoteValidator = [
  ...customerIdValidator,
  body('message').trim().isLength({ min: 2, max: 2000 }).withMessage('Note must be between 2 and 2000 characters.')
];
