import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes, { adminProductRouter } from './routes/productRoutes.js';
import categoryRoutes, { adminCategoryRouter } from './routes/categoryRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import blogRoutes, { adminBlogRouter } from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import swaggerRoutes from './routes/swaggerRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pageRoutes, { publicPageRouter } from './routes/pageRoutes.js';
import siteSettingsRoutes, { publicSiteSettingsRouter } from './routes/siteSettingsRoutes.js';
import navigationRoutes, { publicNavigationRouter } from './routes/navigationRoutes.js';
import testimonialRoutes, { adminTestimonialRouter } from './routes/testimonialRoutes.js';
import exportCountryRoutes, { adminExportCountryRouter } from './routes/exportCountryRoutes.js';
import certificationRoutes, { adminCertificationRouter } from './routes/certificationRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import catalogRoutes, { publicCatalogRouter } from './routes/catalogRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import { adminAuditMiddleware } from './middleware/adminAuditMiddleware.js';
import { logger } from './middleware/loggerMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import {
  compressionMiddleware,
  corsOptions,
  csrfProtection,
  csrfTokenHandler,
  securityHeaders,
  sqlInjectionGuard,
  xssSanitizer
} from './middleware/securityMiddleware.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders());
app.use(compressionMiddleware());
app.use(cors(corsOptions()));
app.use(logger);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(xssSanitizer);
app.use(sqlInjectionGuard);
app.get('/api/v1/csrf-token', csrfTokenHandler);
app.use(csrfProtection);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/api/v1/admin', adminAuditMiddleware);
app.use('/api/v1/admin/products', adminProductRouter);
app.use('/api/v1/admin/categories', adminCategoryRouter);
app.use('/admin/products', adminProductRouter);
app.use('/admin/categories', adminCategoryRouter);
app.use('/api/v1/blogs', blogRoutes);
app.use('/blogs', blogRoutes);
app.use('/api/v1/admin/blogs', adminBlogRouter);
app.use('/admin/blogs', adminBlogRouter);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/pages', pageRoutes);
app.use('/admin/pages', pageRoutes);
app.use('/api/v1/pages', publicPageRouter);
app.use('/pages', publicPageRouter);
app.use('/api/v1/site-settings', publicSiteSettingsRouter);
app.use('/api/v1/navigation', publicNavigationRouter);
app.use('/api/v1/admin/site-settings', siteSettingsRoutes);
app.use('/api/v1/admin/navigation', navigationRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/admin/testimonials', adminTestimonialRouter);
app.use('/api/v1/export-countries', exportCountryRoutes);
app.use('/api/v1/admin/export-countries', adminExportCountryRouter);
app.use('/api/v1/certifications', certificationRoutes);
app.use('/api/v1/admin/certifications', adminCertificationRouter);
app.use('/api/v1/admin/seo', seoRoutes);
app.use('/api/v1/admin/customers', customerRoutes);
app.use('/api/v1/catalogs', publicCatalogRouter);
app.use('/api/v1/admin/product-variants', variantRoutes);
app.use('/api/v1/admin/catalogs', catalogRoutes);
app.use('/api/v1/admin/quotations', quotationRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/notifications', notificationRoutes);
app.use('/api/v1/admin/activity', activityLogRoutes);
app.use('/api/v1/admin/analytics', analyticsRoutes);
app.use('/api/v1/admin/backups', backupRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin', mediaRoutes);
app.use('/admin', mediaRoutes);
app.use('/api/docs', swaggerRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kelvin Eco Products API is running'
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
