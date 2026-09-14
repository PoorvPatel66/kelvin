import { prisma } from '../config/prisma.js';

const sensitiveFields = new Set(['password', 'token', 'otp', 'otpCode', 'secret']);

function sanitize(value) {
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitiveFields.has(key) ? '[REDACTED]' : entry
    ])
  );
}

export async function recordActivity({
  adminId,
  action,
  entityType,
  entityId,
  description,
  metadata,
  ipAddress,
  userAgent
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        adminId: adminId || null,
        action,
        entityType,
        entityId: entityId || null,
        description: description || null,
        metadata: metadata ? sanitize(metadata) : undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });
  } catch (error) {
    console.error(`Activity log failed: ${error.message}`);
    return null;
  }
}
