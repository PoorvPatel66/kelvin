import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
  const where = {};
  if (req.query.adminId) where.adminId = req.query.adminId;
  if (req.query.entityType) where.entityType = req.query.entityType;
  if (req.query.action) where.action = { contains: req.query.action, mode: 'insensitive' };
  if (req.query.search) where.OR = [
    { action: { contains: req.query.search, mode: 'insensitive' } },
    { entityType: { contains: req.query.search, mode: 'insensitive' } },
    { description: { contains: req.query.search, mode: 'insensitive' } }
  ];

  const [logs, totalLogs] = await Promise.all([
    prisma.activityLog.findMany({ where, include: { admin: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.activityLog.count({ where })
  ]);
  res.json({ success: true, logs, currentPage: page, totalPages: Math.ceil(totalLogs / limit) || 1, totalLogs });
});
