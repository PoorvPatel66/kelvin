import { recordActivity } from '../services/activityLogService.js';

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function adminAuditMiddleware(req, res, next) {
  if (!mutationMethods.has(req.method)) return next();

  res.on('finish', () => {
    if (!req.user || res.statusCode >= 500) return;

    void recordActivity({
      adminId: req.user.id,
      action: `${req.method} ${req.baseUrl}${req.path}`,
      entityType: req.baseUrl.split('/').filter(Boolean).at(-1) || 'admin',
      entityId: req.params?.id,
      description: `${req.user.name} performed ${req.method} on ${req.originalUrl}`,
      metadata: { statusCode: res.statusCode, params: req.params, body: req.body },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}
