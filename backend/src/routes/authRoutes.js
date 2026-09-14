import express from 'express';
import {
  forgotPassword,
  login,
  logout,
  me,
  registerAdmin,
  requestOwnerOtp,
  resetPassword,
  verifyOwnerLogin
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  forgotPasswordValidator,
  loginValidator,
  ownerOtpRequestValidator,
  ownerOtpVerifyValidator,
  registerAdminValidator,
  resetPasswordValidator
} from '../validators/authValidators.js';

const router = express.Router();

router.post(
  '/register',
  protect,
  authorize('SUPER_ADMIN'),
  registerAdminValidator,
  validateRequest,
  registerAdmin
);
router.post('/login', loginRateLimiter, loginValidator, validateRequest, login);
router.post(
  '/owner/request-otp',
  loginRateLimiter,
  ownerOtpRequestValidator,
  validateRequest,
  requestOwnerOtp
);
router.post(
  '/owner/verify-otp',
  loginRateLimiter,
  ownerOtpVerifyValidator,
  validateRequest,
  verifyOwnerLogin
);
router.post('/logout', logout);
router.get('/me', protect, me);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);

export default router;
