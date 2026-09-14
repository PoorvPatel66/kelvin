import express from 'express';
import {
  addCustomerNote,
  createCustomer,
  deleteCustomer,
  exportCustomersCsv,
  getCustomerById,
  getCustomers,
  updateCustomer
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createCustomerValidator,
  customerIdValidator,
  customerListValidator,
  customerNoteValidator,
  updateCustomerValidator
} from '../validators/customerValidators.js';

const router = express.Router();

router.use(protect, requirePermission('sales.manage'));
router.get('/', customerListValidator, validateRequest, getCustomers);
router.get('/export.csv', customerListValidator, validateRequest, exportCustomersCsv);
router.post('/', createCustomerValidator, validateRequest, createCustomer);
router.get('/:id', customerIdValidator, validateRequest, getCustomerById);
router.put('/:id', updateCustomerValidator, validateRequest, updateCustomer);
router.delete('/:id', customerIdValidator, validateRequest, deleteCustomer);
router.post('/:id/notes', customerNoteValidator, validateRequest, addCustomerNote);

export default router;
