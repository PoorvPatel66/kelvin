import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function groupCounts(rows, key) {
  const counts = new Map();
  rows.forEach((row) => {
    const value = row[key] || 'Unknown';
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number.parseInt(req.query.days, 10) || 30, 1), 365);
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - days + 1);
  const visits = await prisma.visitorAnalytics.findMany({ where: { createdAt: { gte: from } }, orderBy: { createdAt: 'asc' } });
  const uniqueVisitors = new Set(visits.map((visit) => visit.ipHash).filter(Boolean)).size;
  const dailyMap = new Map();
  visits.forEach((visit) => {
    const day = visit.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  });
  res.json({
    success: true,
    analytics: {
      days,
      totalVisits: visits.length,
      uniqueVisitors,
      daily: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
      topPages: groupCounts(visits, 'path').slice(0, 10),
      sources: groupCounts(visits, 'source').slice(0, 10),
      devices: groupCounts(visits, 'device').slice(0, 10),
      countries: groupCounts(visits, 'country').slice(0, 10)
    }
  });
});
