import express from 'express';
import { createCatalog, deleteCatalog, getCatalogs, getPublicCatalogs, updateCatalog } from '../controllers/catalogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { catalogCreateValidator, uuidParam } from '../validators/adminOperationsValidators.js';

export const publicCatalogRouter = express.Router();
publicCatalogRouter.get('/', getPublicCatalogs);

const router = express.Router();
router.use(protect, requirePermission('catalogs.manage'));
router.get('/', getCatalogs);
router.post('/', catalogCreateValidator, validateRequest, createCatalog);
router.put('/:id', [...uuidParam, ...catalogCreateValidator], validateRequest, updateCatalog);
router.delete('/:id', uuidParam, validateRequest, deleteCatalog);

export default router;
