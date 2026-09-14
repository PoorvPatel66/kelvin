import api from './api.js';

export async function fetchDashboardSummary() {
  const response = await api.get('/admin/dashboard/summary');
  return response.data?.data;
}

export async function fetchMonthlyInquiries(year) {
  const response = await api.get('/admin/dashboard/inquiries/monthly', {
    params: { year }
  });
  return response.data?.data;
}

export async function fetchLatestInquiries(params = { limit: 10 }) {
  const response = await api.get('/admin/dashboard/inquiries/latest', { params });
  return response.data;
}

export async function fetchRecentBlogs(params = { limit: 5 }) {
  const response = await api.get('/admin/dashboard/blogs/recent', { params });
  return response.data;
}

export async function fetchDashboardFeaturedProducts(params = { limit: 6 }) {
  const response = await api.get('/admin/dashboard/products/featured', { params });
  return response.data;
}

export async function fetchVisitorAnalytics(year) {
  const response = await api.get('/admin/dashboard/visitors', {
    params: { year }
  });
  return response.data?.data;
}
