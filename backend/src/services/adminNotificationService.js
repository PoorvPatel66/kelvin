import { prisma } from '../config/prisma.js';

export async function createAdminNotification({
  adminId,
  type = 'INFO',
  title,
  message,
  entityType,
  entityId,
  actionUrl
}) {
  try {
    return await prisma.notification.create({
      data: {
        adminId: adminId || null,
        type,
        title,
        message,
        entityType: entityType || null,
        entityId: entityId || null,
        actionUrl: actionUrl || null
      }
    });
  } catch (error) {
    console.error(`Admin notification failed: ${error.message}`);
    return null;
  }
}
