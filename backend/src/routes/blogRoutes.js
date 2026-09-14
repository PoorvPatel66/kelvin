import express from 'express';
import {
  createBlog,
  createBlogCategory,
  deleteBlog,
  deleteBlogCategory,
  draftBlog,
  getAdminBlogById,
  getAdminBlogs,
  getBlogBySlug,
  getBlogCategories,
  getBlogs,
  publishBlog,
  permanentlyDeleteBlog,
  restoreBlog,
  setFeaturedBlog,
  setRelatedArticles,
  updateBlog,
  updateBlogCategory,
  updateBlogStatus
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { singleImageUpload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  blogIdValidator,
  blogListValidator,
  blogSlugValidator,
  blogStatusValidator,
  createBlogCategoryValidator,
  createBlogValidator,
  relatedArticlesValidator,
  blogCategoryIdValidator,
  updateBlogCategoryValidator,
  updateBlogValidator
} from '../validators/blogValidators.js';

const router = express.Router();

router.get('/', blogListValidator, validateRequest, getBlogs);
router.get('/categories', getBlogCategories);
router.get('/:slug', blogSlugValidator, validateRequest, getBlogBySlug);

export const adminBlogRouter = express.Router();

adminBlogRouter.use(protect, requirePermission('content.manage'));

adminBlogRouter.get('/', blogListValidator, validateRequest, getAdminBlogs);
adminBlogRouter.post(
  '/',
  singleImageUpload('thumbnail'),
  createBlogValidator,
  validateRequest,
  createBlog
);
adminBlogRouter.get('/meta/categories', getBlogCategories);
adminBlogRouter.post(
  '/meta/categories',
  createBlogCategoryValidator,
  validateRequest,
  createBlogCategory
);
adminBlogRouter.put(
  '/meta/categories/:id',
  updateBlogCategoryValidator,
  validateRequest,
  updateBlogCategory
);
adminBlogRouter.delete(
  '/meta/categories/:id',
  blogCategoryIdValidator,
  validateRequest,
  deleteBlogCategory
);
adminBlogRouter.get('/:id', blogIdValidator, validateRequest, getAdminBlogById);
adminBlogRouter.put(
  '/:id',
  singleImageUpload('thumbnail'),
  updateBlogValidator,
  validateRequest,
  updateBlog
);
adminBlogRouter.delete('/:id', blogIdValidator, validateRequest, deleteBlog);
adminBlogRouter.post('/:id/restore', blogIdValidator, validateRequest, restoreBlog);
adminBlogRouter.delete('/:id/permanent', blogIdValidator, validateRequest, permanentlyDeleteBlog);
adminBlogRouter.patch('/:id/status', blogStatusValidator, validateRequest, updateBlogStatus);
adminBlogRouter.patch('/:id/publish', blogIdValidator, validateRequest, publishBlog);
adminBlogRouter.patch('/:id/draft', blogIdValidator, validateRequest, draftBlog);
adminBlogRouter.patch('/:id/featured', blogIdValidator, validateRequest, setFeaturedBlog);
adminBlogRouter.put('/:id/related', relatedArticlesValidator, validateRequest, setRelatedArticles);

export default router;
