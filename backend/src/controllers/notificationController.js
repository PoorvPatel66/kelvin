import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function notificationWhere(adminId) {
  return { OR: [{ adminId }, { adminId: null }] };
}

export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const filters = [notificationWhere(req.user.id)];
  const search = String(req.query.search || '').trim();

  if (req.query.unread === 'true') filters.push({ isRead: false });
  if (search) {
    filters.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ]
    });
  }

  const where = { AND: filters };

  const [notifications, totalNotifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...notificationWhere(req.user.id), isRead: false } })
  ]);
  res.json({ success: true, notifications, unreadCount, currentPage: page, totalPages: Math.ceil(totalNotifications / limit) || 1, totalNotifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, ...notificationWhere(req.user.id) } });
  if (!notification) throw new AppError('Notification not found.', 404);
  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true, readAt: new Date() } });
  res.json({ success: true, notification: updated });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { ...notificationWhere(req.user.id), isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
  res.json({ success: true, message: `${result.count} notifications marked as read.` });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, adminId: req.user.id } });
  if (!notification) throw new AppError('Only personal notifications can be deleted.', 404);
  await prisma.notification.delete({ where: { id: notification.id } });
  res.json({ success: true, message: 'Notification deleted.' });
});
