import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    throw new AppError('Authentication token is required.', 401);
  }

  const decoded = verifyToken(token);
  const admin = await prisma.admin.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      isActive: true,
      tokenVersion: true,
      mobile: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!admin || !admin.isActive || (decoded.tokenVersion || 0) !== admin.tokenVersion) {
    throw new AppError('User is not authorized.', 401);
  }

  const { tokenVersion, ...safeAdmin } = admin;
  req.user = safeAdmin;
  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
}
