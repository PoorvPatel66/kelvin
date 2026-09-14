import express from 'express';
import {
  deleteMediaAsset,
  deleteBlogImage,
  deleteCertificateIcon,
  deleteCountryFlag,
  deleteProductImage,
  replaceMediaAsset,
  replaceProductImage,
  uploadBlogImage,
  uploadCertificateIcon,
  uploadCountryFlag,
  uploadHeroBanners,
  uploadMediaAsset,
  uploadProductImages
} from '../controllers/mediaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { multipleImageUpload, singleImageUpload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  blogUploadValidator,
  blogImageDeleteValidator,
  certificateIconUploadValidator,
  countryFlagUploadValidator,
  mediaAssetIdValidator,
  mediaAssetUploadValidator,
  productImageIdValidator,
  productUploadValidator
} from '../validators/mediaValidators.js';

const router = express.Router();

router.use(protect, requirePermission('website.manage'));

router.post(
  '/product/upload',
  multipleImageUpload('images', 10),
  productUploadValidator,
  validateRequest,
  uploadProductImages
);

router.post(
  '/blog/upload',
  singleImageUpload('image'),
  blogUploadValidator,
  validateRequest,
  uploadBlogImage
);

router.delete(
  '/blog/:id/image/:imageType',
  blogImageDeleteValidator,
  validateRequest,
  deleteBlogImage
);

router.post('/banners/upload', multipleImageUpload('images', 10), uploadHeroBanners);

router.post(
  '/media/upload',
  singleImageUpload('image'),
  mediaAssetUploadValidator,
  validateRequest,
  uploadMediaAsset
);

router.post(
  '/countries/:id/flag',
  singleImageUpload('image'),
  countryFlagUploadValidator,
  validateRequest,
  uploadCountryFlag
);

router.delete(
  '/countries/:id/flag',
  countryFlagUploadValidator,
  validateRequest,
  deleteCountryFlag
);

router.post(
  '/certificates/:id/icon',
  singleImageUpload('image'),
  certificateIconUploadValidator,
  validateRequest,
  uploadCertificateIcon
);

router.delete(
  '/certificates/:id/icon',
  certificateIconUploadValidator,
  validateRequest,
  deleteCertificateIcon
);

router.delete(
  '/product-images/:id',
  productImageIdValidator,
  validateRequest,
  deleteProductImage
);

router.put(
  '/product-images/:id',
  singleImageUpload('image'),
  productImageIdValidator,
  validateRequest,
  replaceProductImage
);

router.delete('/assets/:id', mediaAssetIdValidator, validateRequest, deleteMediaAsset);

router.put(
  '/assets/:id',
  singleImageUpload('image'),
  mediaAssetIdValidator,
  validateRequest,
  replaceMediaAsset
);

export default router;
