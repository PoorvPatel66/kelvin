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
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout.jsx'));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage.jsx'));
const AdminProductEditorPage = lazy(() => import('./admin/pages/AdminProductEditorPage.jsx'));
const AdminMediaPage = lazy(() => import('./admin/pages/AdminMediaPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./admin/pages/AdminCategoriesPage.jsx'));
const AdminBlogsPage = lazy(() => import('./admin/pages/AdminBlogsPage.jsx'));
const AdminInquiriesPage = lazy(() => import('./admin/pages/AdminInquiriesPage.jsx'));
const AdminCustomersPage = lazy(() => import('./admin/pages/AdminCustomersPage.jsx'));
const AdminPagesPage = lazy(() => import('./admin/pages/AdminPagesPage.jsx'));
const AdminSiteSettingsPage = lazy(() => import('./admin/pages/AdminSiteSettingsPage.jsx'));
const AdminNavigationPage = lazy(() => import('./admin/pages/AdminNavigationPage.jsx'));
const AdminTestimonialsPage = lazy(() => import('./admin/pages/AdminTestimonialsPage.jsx'));
const AdminExportMarketsPage = lazy(() => import('./admin/pages/AdminExportMarketsPage.jsx'));
const AdminCertificationsPage = lazy(() => import('./admin/pages/AdminCertificationsPage.jsx'));
const AdminSeoPage = lazy(() => import('./admin/pages/AdminSeoPage.jsx'));
const AdminVariantsPage = lazy(() => import('./admin/pages/AdminVariantsPage.jsx'));
const AdminCatalogsPage = lazy(() => import('./admin/pages/AdminCatalogsPage.jsx'));
const AdminQuotationsPage = lazy(() => import('./admin/pages/AdminQuotationsPage.jsx'));
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage.jsx'));
const AdminNotificationsPage = lazy(() => import('./admin/pages/AdminNotificationsPage.jsx'));
const AdminActivityPage = lazy(() => import('./admin/pages/AdminActivityPage.jsx'));
const AdminAnalyticsPage = lazy(() => import('./admin/pages/AdminAnalyticsPage.jsx'));
const AdminBackupsPage = lazy(() => import('./admin/pages/AdminBackupsPage.jsx'));
const AdminCustomizationPage = lazy(() => import('./admin/pages/AdminCustomizationPage.jsx'));

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
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductEditorPage />} />
              <Route path="products/:id/edit" element={<AdminProductEditorPage />} />
              <Route path="variants" element={<AdminVariantsPage />} />
              <Route path="catalogs" element={<AdminCatalogsPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="customization" element={<AdminCustomizationPage />} />
              <Route path="site-settings" element={<AdminSiteSettingsPage />} />
              <Route path="navigation" element={<AdminNavigationPage />} />
              <Route path="seo" element={<AdminSeoPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="blogs" element={<AdminBlogsPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="export-markets" element={<AdminExportMarketsPage />} />
              <Route path="certifications" element={<AdminCertificationsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="quotations" element={<AdminQuotationsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="backups" element={<AdminBackupsPage />} />
              <Route
                path="leads"
                element={
                  <AdminInquiriesPage
                    title="Leads"
                    description="View and manage every inquiry captured from contact, quote, newsletter, brochure, and WhatsApp forms."
                  />
                }
              />
              <Route
                path="quotes"
                element={
                  <AdminInquiriesPage
                    type="REQUEST_QUOTE"
                    title="Quote Requests"
                    description="Manage quotation requests submitted from the website request quote popup and product detail actions."
                  />
                }
              />
              <Route
                path="contact-enquiries"
                element={
                  <AdminInquiriesPage
                    type="CONTACT"
                    title="Contact Enquiries"
                    description="Review messages submitted from the public contact page."
                  />
                }
              />
              <Route
                path="newsletter"
                element={
                  <AdminInquiriesPage
                    type="NEWSLETTER"
                    title="Newsletter"
                    description="View newsletter subscribers captured from website forms."
                  />
                }
              />
            </Route>
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
