import { body } from 'express-validator';

const strongPasswordMessage =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export const registerAdminValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail(),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage(strongPasswordMessage),
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN'])
    .withMessage('Role must be SUPER_ADMIN or ADMIN.')
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

export const ownerOtpRequestValidator = [
  body('ownerName')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Owner name must be between 2 and 80 characters.'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required.')
    .matches(/^[+\d\s()-]{8,20}$/)
    .withMessage('Valid mobile number is required.'),
  body('password').notEmpty().withMessage('Admin password is required.')
];

export const ownerOtpVerifyValidator = [
  ...ownerOtpRequestValidator,
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Valid 6 digit OTP is required.')
    .isNumeric()
    .withMessage('OTP must contain only numbers.')
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail(),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Valid 6 digit OTP is required.')
    .isNumeric()
    .withMessage('OTP must contain only numbers.'),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage(strongPasswordMessage)
];
