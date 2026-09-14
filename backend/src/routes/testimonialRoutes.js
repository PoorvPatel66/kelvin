import express from 'express';
import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  getTestimonials,
  updateTestimonial
} from '../controllers/testimonialController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createTestimonialValidator,
  testimonialIdValidator,
  testimonialListValidator,
  updateTestimonialValidator
} from '../validators/testimonialValidators.js';

const router = express.Router();
export const adminTestimonialRouter = express.Router();

router.get('/', testimonialListValidator, validateRequest, getTestimonials);

adminTestimonialRouter.use(protect, requirePermission('content.manage'));
adminTestimonialRouter.get('/', testimonialListValidator, validateRequest, getAdminTestimonials);
adminTestimonialRouter.post('/', createTestimonialValidator, validateRequest, createTestimonial);
adminTestimonialRouter.put('/:id', updateTestimonialValidator, validateRequest, updateTestimonial);
adminTestimonialRouter.delete('/:id', testimonialIdValidator, validateRequest, deleteTestimonial);

export default router;
