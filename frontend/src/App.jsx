import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Skeleton from './components/common/Skeleton.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import RequestQuoteModal from './components/quote/RequestQuoteModal.jsx';
import SEO from './components/seo/SEO.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { usePageAnalytics } from './hooks/usePageAnalytics.js';
import { organizationSchema, websiteSchema } from './seo/schema.js';
import FloatingElements from './components/common/FloatingElements.jsx';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp.jsx';
import { ALL_ROLES, CATALOG_ROLES, CONTENT_ROLES, SALES_ROLES, WEBSITE_ROLES } from './admin/data/adminNavigation.js';

const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage.jsx'));
const ContactPage = lazy(() => import('./pages/public/ContactPage.jsx'));
const HomePage = lazy(() => import('./pages/public/HomePage.jsx'));
const AboutPage = lazy(() => import('./pages/public/AboutPage.jsx'));
const ProductsPage = lazy(() => import('./pages/public/ProductsPage.jsx'));
const QualityPage = lazy(() => import('./pages/public/QualityPage.jsx'));
const BlogListPage = lazy(() => import('./pages/public/BlogListPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminForgotPasswordPage = lazy(() => import('./pages/admin/AdminForgotPasswordPage.jsx'));
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage.jsx'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout.jsx'));
const AdminAboutPage = lazy(() => import('./admin/pages/AdminPagesPage.jsx'));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage.jsx'));
const AdminProductEditorPage = lazy(() => import('./admin/pages/AdminProductEditorPage.jsx'));
const AdminBlogsPage = lazy(() => import('./admin/pages/AdminBlogsPage.jsx'));
const AdminInquiriesPage = lazy(() => import('./admin/pages/AdminInquiriesPage.jsx'));
const AdminProfilePage = lazy(() => import('./admin/pages/AdminProfilePage.jsx'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  usePageAnalytics();

  const openQuoteModal = useCallback(() => {
    setIsQuoteModalOpen(true);
  }, []);

  const closeQuoteModal = useCallback(() => {
    setIsQuoteModalOpen(false);
  }, []);

  useEffect(() => {
    if (isAdminRoute) return undefined;

    const handleOpenQuote = () => openQuoteModal();

    const handleQuoteClick = (event) => {
      const trigger = event.target.closest?.('a, button');

      if (!trigger || trigger.closest('.quote-modal')) {
        return;
      }

      const href = trigger.getAttribute('href') || '';
      const label = trigger.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
      const isQuoteLink = href === '/request-quote' || href.endsWith('/request-quote');
      const isQuoteButton = /\brequest\s+(a\s+)?quote\b/.test(label);

      if (!isQuoteLink && !isQuoteButton) {
        return;
      }

      event.preventDefault();
      openQuoteModal();
    };

    window.addEventListener('open-request-quote', handleOpenQuote);
    document.addEventListener('click', handleQuoteClick, true);

    return () => {
      window.removeEventListener('open-request-quote', handleOpenQuote);
      document.removeEventListener('click', handleQuoteClick, true);
    };
  }, [isAdminRoute, openQuoteModal]);

  useEffect(() => {
    if (!isAdminRoute && location.pathname === '/request-quote') {
      openQuoteModal();
      navigate('/', { replace: true });
    }
  }, [isAdminRoute, location.pathname, navigate, openQuoteModal]);

  return (
    <>
      <SEO jsonLd={[organizationSchema(), websiteSchema()]} />
      <ScrollToTop />
      {!isAdminRoute && <FloatingElements />}
      {!isAdminRoute && <Navbar />}
      <Suspense
        fallback={
          <main className="section">
            <div className="container-xl">
              <Skeleton rows={4} />
            </div>
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/request-quote" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={ALL_ROLES}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<ProtectedRoute allowedRoles={WEBSITE_ROLES}><AdminAboutPage pageKey="about" /></ProtectedRoute>} />
            <Route path="about" element={<ProtectedRoute allowedRoles={WEBSITE_ROLES}><AdminAboutPage pageKey="about" /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute allowedRoles={CATALOG_ROLES}><AdminProductsPage /></ProtectedRoute>} />
            <Route path="products/new" element={<ProtectedRoute allowedRoles={CATALOG_ROLES}><AdminProductEditorPage /></ProtectedRoute>} />
            <Route path="products/:id/edit" element={<ProtectedRoute allowedRoles={CATALOG_ROLES}><AdminProductEditorPage /></ProtectedRoute>} />
            <Route path="contact" element={<ProtectedRoute allowedRoles={SALES_ROLES}><AdminInquiriesPage type="CONTACT" title="Contact" description="Manage messages submitted from the public contact form." /></ProtectedRoute>} />
            <Route path="blog" element={<ProtectedRoute allowedRoles={CONTENT_ROLES}><AdminBlogsPage /></ProtectedRoute>} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp />}
      {!isAdminRoute && <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={closeQuoteModal} />}
    </>
  );
}

export default App;
