import express from 'express';
import {
  createExportCountry,
  deleteExportCountry,
  getAdminExportCountries,
  getExportCountries,
  updateExportCountry
} from '../controllers/exportCountryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createExportCountryValidator,
  exportCountryIdValidator,
  exportCountryListValidator,
  updateExportCountryValidator
} from '../validators/exportCountryValidators.js';

const router = express.Router();
export const adminExportCountryRouter = express.Router();

router.get('/', getExportCountries);

adminExportCountryRouter.use(protect, requirePermission('content.manage'));
adminExportCountryRouter.get('/', exportCountryListValidator, validateRequest, getAdminExportCountries);
adminExportCountryRouter.post('/', createExportCountryValidator, validateRequest, createExportCountry);
adminExportCountryRouter.put('/:id', updateExportCountryValidator, validateRequest, updateExportCountry);
adminExportCountryRouter.delete('/:id', exportCountryIdValidator, validateRequest, deleteExportCountry);

export default router;
