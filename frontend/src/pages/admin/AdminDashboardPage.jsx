import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FolderOpen, MailOpen, Newspaper, Package, Plus, Users } from 'lucide-react';
import Skeleton from '../../components/common/Skeleton.jsx';
import SEO from '../../components/seo/SEO.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  fetchDashboardFeaturedProducts,
  fetchDashboardSummary,
  fetchLatestInquiries,
  fetchMonthlyInquiries,
  fetchRecentBlogs,
  fetchVisitorAnalytics
} from '../../services/dashboardService.js';
import './AdminDashboardPage.css';

const statConfig = {
  products: { label: 'Products', icon: Package },
  blogs: { label: 'Blogs', icon: Newspaper },
  inquiries: { label: 'Inquiries', icon: MailOpen },
  customers: { label: 'Customers', icon: Users },
  categories: { label: 'Categories', icon: FolderOpen }
};

function getResponseList(response, key) {
  return response?.[key] || response?.data?.[key] || [];
}

function AdminDashboardPage() {
  const currentYear = new Date().getFullYear();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [latestInquiries, setLatestInquiries] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [visitors, setVisitors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [summaryData, monthlyData, inquiryData, blogData, productData, visitorData] = await Promise.allSettled([
          fetchDashboardSummary(),
          fetchMonthlyInquiries(currentYear),
          fetchLatestInquiries({ limit: 10 }),
          fetchRecentBlogs({ limit: 5 }),
          fetchDashboardFeaturedProducts({ limit: 6 }),
          fetchVisitorAnalytics(currentYear)
        ]);

        if (!isMounted) return;

        setSummary(summaryData.status === 'fulfilled' ? summaryData.value : null);
        setMonthly(monthlyData.status === 'fulfilled' ? monthlyData.value?.months || [] : []);
        setLatestInquiries(inquiryData.status === 'fulfilled' ? getResponseList(inquiryData.value, 'inquiries') : []);
        setRecentBlogs(blogData.status === 'fulfilled' ? getResponseList(blogData.value, 'blogs') : []);
        setFeaturedProducts(productData.status === 'fulfilled' ? getResponseList(productData.value, 'products') : []);
        setVisitors(visitorData.status === 'fulfilled' ? visitorData.value : null);

        const hasRejected = [summaryData, monthlyData, inquiryData, blogData, productData, visitorData].some(
          (result) => result.status === 'rejected'
        );

        if (hasRejected) {
          showToast({ type: 'error', message: 'Some dashboard widgets could not be loaded.' });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [currentYear, showToast]);

  const maxMonthlyCount = useMemo(() => Math.max(...monthly.map((item) => item.count), 1), [monthly]);

  return (
    <main className="admin-dashboard">
      <SEO title="Admin Dashboard" canonicalPath="/admin" noindex />

      <section className="admin-dashboard__hero">
        <div>
          <span>Admin Overview</span>
          <h2>Control products, content, and B2B inquiry operations from one secure workspace.</h2>
        </div>
        <Link className="admin-btn admin-btn--primary" to="/admin/products/new">
          <Plus size={18} aria-hidden="true" />
          Add Product
        </Link>
      </section>

      {isLoading ? (
        <section className="admin-dashboard__loading">
          <Skeleton rows={4} />
        </section>
      ) : (
        <>
          <section className="admin-dashboard__stats">
            {Object.entries(statConfig).map(([key, config]) => {
              const Icon = config.icon;

              return (
                <article className="admin-dashboard__stat" key={key}>
                  <span>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p>{config.label}</p>
                    <strong>{summary?.[key] ?? 0}</strong>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-dashboard__grid">
            <article className="admin-dashboard__panel admin-dashboard__panel--wide">
              <div className="admin-dashboard__panel-head">
                <div>
                  <h3>Monthly Inquiry Stats</h3>
                  <p>{currentYear} contact and quotation demand</p>
                </div>
                <BarChart3 size={22} aria-hidden="true" />
              </div>
              <div className="admin-dashboard__chart">
                {monthly.length === 0 ? (
                  <p className="admin-dashboard__muted">No monthly inquiry data yet.</p>
                ) : (
                  monthly.map((item) => (
                    <div className="admin-dashboard__bar" key={item.month}>
                      <span style={{ height: `${Math.max((item.count / maxMonthlyCount) * 100, 5)}%` }} />
                      <small>{item.month}</small>
                      <strong>{item.count}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-head">
                <h3>Visitors</h3>
              </div>
              <strong className="admin-dashboard__big-number">{visitors?.totalVisitors || 0}</strong>
              <p className="admin-dashboard__muted">{visitors?.currentMonthVisitors || 0} this month</p>
            </article>
          </section>

          <section className="admin-dashboard__lists">
            <article className="admin-dashboard__panel">
              <h3>Latest Inquiries</h3>
              <div className="admin-dashboard__list">
                {latestInquiries.length === 0 ? (
                  <p className="admin-dashboard__muted">No inquiries yet.</p>
                ) : (
                  latestInquiries.map((inquiry) => (
                    <div className="admin-dashboard__list-item" key={inquiry.id}>
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.product || inquiry.country || inquiry.email}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <h3>Recent Blogs</h3>
              <div className="admin-dashboard__list">
                {recentBlogs.length === 0 ? (
                  <p className="admin-dashboard__muted">No blog data yet.</p>
                ) : (
                  recentBlogs.map((blog) => (
                    <div className="admin-dashboard__list-item" key={blog.id}>
                      <strong>{blog.title}</strong>
                      <span>{blog.status}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <h3>Featured Products</h3>
              <div className="admin-dashboard__list">
                {featuredProducts.length === 0 ? (
                  <p className="admin-dashboard__muted">No featured products yet.</p>
                ) : (
                  featuredProducts.map((product) => (
                    <div className="admin-dashboard__list-item" key={product.id}>
                      <strong>{product.name}</strong>
                      <span>{product.category?.name || product.status}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboardPage;
