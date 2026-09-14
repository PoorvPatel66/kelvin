import express from 'express';
import { body } from 'express-validator';
import { createAdminUser, deactivateAdminUser, getAdminUsers, updateAdminUser } from '../controllers/adminUserController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uuidParam } from '../validators/adminOperationsValidators.js';

const router = express.Router();
const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'SEO_MANAGER', 'VIEWER'];
const createValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('mobile').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 7, max: 24 }),
  body('password').isStrongPassword({ minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
  body('role').optional().isIn(roles),
  body('permissions').optional().isArray(),
  body('isActive').optional().isBoolean()
];
const updateValidator = [
  ...uuidParam,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('mobile').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 7, max: 24 }),
  body('password').optional({ checkFalsy: true }).isStrongPassword({ minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
  body('role').optional().isIn(roles),
  body('permissions').optional().isArray(),
  body('isActive').optional().isBoolean()
];

router.use(protect, authorize('SUPER_ADMIN'));
router.get('/', getAdminUsers);
router.post('/', createValidator, validateRequest, createAdminUser);
router.put('/:id', updateValidator, validateRequest, updateAdminUser);
router.delete('/:id', uuidParam, validateRequest, deactivateAdminUser);

export default router;
