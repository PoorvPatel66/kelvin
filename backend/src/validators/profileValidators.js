import { body } from 'express-validator';

const strongPasswordMessage =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

const phoneValidator = body('phone')
  .trim()
  .matches(/^[+\d\s()-]{8,20}$/)
  .withMessage('Valid phone number is required.');

export const profileValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters.')
];

export const emailChangeRequestValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail()
];

export const phoneChangeRequestValidator = [phoneValidator];

export const verificationValidator = [
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Valid 6 digit OTP is required.')
    .isNumeric()
    .withMessage('OTP must contain only numbers.')
];

export const passwordChangeValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(strongPasswordMessage),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match.');
    return true;
  })
];