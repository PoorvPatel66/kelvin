import express from 'express';
import {
  createCertification,
  deleteCertification,
  getAdminCertifications,
  getCertifications,
  updateCertification
} from '../controllers/certificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  certificationIdValidator,
  certificationListValidator,
  createCertificationValidator,
  updateCertificationValidator
} from '../validators/certificationValidators.js';

const router = express.Router();
export const adminCertificationRouter = express.Router();

router.get('/', getCertifications);

adminCertificationRouter.use(protect, requirePermission('content.manage'));
adminCertificationRouter.get('/', certificationListValidator, validateRequest, getAdminCertifications);
adminCertificationRouter.post('/', createCertificationValidator, validateRequest, createCertification);
adminCertificationRouter.put('/:id', updateCertificationValidator, validateRequest, updateCertification);
adminCertificationRouter.delete('/:id', certificationIdValidator, validateRequest, deleteCertification);

export default router;
