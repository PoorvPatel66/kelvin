import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  changePassword, getProfile, requestEmailChange, requestPhoneChange,
  updateProfile, verifyEmailChange, verifyPhoneChange
} from '../controllers/profileController.js';
import {
  emailChangeRequestValidator, passwordChangeValidator, phoneChangeRequestValidator,
  profileValidator, verificationValidator
} from '../validators/profileValidators.js';

const router = express.Router();
router.use(protect);
router.get('/', getProfile);
router.patch('/', profileValidator, validateRequest, updateProfile);
router.post('/email/request', emailChangeRequestValidator, validateRequest, requestEmailChange);
router.post('/email/verify', [...emailChangeRequestValidator, ...verificationValidator], validateRequest, verifyEmailChange);
router.post('/phone/request', phoneChangeRequestValidator, validateRequest, requestPhoneChange);
router.post('/phone/verify', [...phoneChangeRequestValidator, ...verificationValidator], validateRequest, verifyPhoneChange);
router.patch('/password', passwordChangeValidator, validateRequest, changePassword);

export default router;