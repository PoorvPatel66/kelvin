import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDashboardSummary,
  getFeaturedProducts,
  getLatestInquiries,
  getMonthlyInquiryStats,
  getRecentBlogs,
  getVisitorsAnalytics,
  globalSearch
} from '../services/dashboardService.js';

export const dashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary();

  res.status(200).json({
    success: true,
    data: summary
  });
});

export const monthlyInquiryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getMonthlyInquiryStats(req.query.year);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const latestInquiries = asyncHandler(async (req, res) => {
  const data = await getLatestInquiries(req.query);

  res.status(200).json({
    success: true,
    ...data
  });
});

export const recentBlogs = asyncHandler(async (req, res) => {
  const data = await getRecentBlogs(req.query);

  res.status(200).json({
    success: true,
    ...data
  });
});

export const featuredProducts = asyncHandler(async (req, res) => {
  const data = await getFeaturedProducts(req.query);

  res.status(200).json({
    success: true,
    ...data
  });
});

export const dashboardGlobalSearch = asyncHandler(async (req, res) => {
  const results = await globalSearch(req.query);

  res.status(200).json({
    success: true,
    ...results
  });
});

export const visitorAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getVisitorsAnalytics(req.query);

  res.status(200).json({
    success: true,
    data: analytics
  });
});
