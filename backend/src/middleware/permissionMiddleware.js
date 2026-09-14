import AppError from '../utils/AppError.js';

const rolePermissions = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'dashboard.read',
    'products.manage',
    'content.manage',
    'website.manage',
    'sales.manage',
    'catalogs.manage',
    'analytics.read',
    'notifications.manage'
  ],
  CONTENT_MANAGER: ['dashboard.read', 'products.manage', 'content.manage', 'catalogs.manage'],
  SALES_MANAGER: ['dashboard.read', 'sales.manage', 'notifications.manage'],
  SEO_MANAGER: ['dashboard.read', 'content.manage', 'website.manage', 'analytics.read'],
  VIEWER: ['dashboard.read', 'analytics.read']
};

export function hasPermission(user, permission) {
  if (!user) return false;
  const permissions = new Set([...(rolePermissions[user.role] || []), ...(user.permissions || [])]);
  return permissions.has('*') || permissions.has(permission);
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user, permission)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
}

export { rolePermissions };
