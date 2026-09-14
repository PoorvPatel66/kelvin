import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword } from '../utils/passwordUtils.js';

const safeAdminSelect = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  role: true,
  permissions: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
};

export const getAdminUsers = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
      { mobile: { contains: req.query.search, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.admin.findMany({ where, select: safeAdminSelect, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, users, roles: Object.values(Role), totalUsers: users.length });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const existing = await prisma.admin.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError('An admin with this email already exists.', 409);

  const user = await prisma.admin.create({
    data: {
      name: req.body.name.trim(),
      email,
      mobile: req.body.mobile || null,
      password: await hashPassword(req.body.password),
      role: req.body.role || Role.ADMIN,
      permissions: req.body.permissions || [],
      isActive: req.body.isActive ?? true
    },
    select: safeAdminSelect
  });
  res.status(201).json({ success: true, message: 'Admin user created.', user });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const existing = await prisma.admin.findUnique({ where: { id: req.params.id }, select: { id: true, role: true } });
  if (!existing) throw new AppError('Admin user not found.', 404);
  if (req.params.id === req.user.id && req.body.isActive === false) {
    throw new AppError('You cannot deactivate your own account.', 409);
  }

  const data = {};
  for (const field of ['name', 'mobile', 'role', 'permissions', 'isActive']) {
    if (req.body[field] !== undefined) data[field] = req.body[field] === '' ? null : req.body[field];
  }
  if (req.body.email !== undefined) data.email = req.body.email.trim().toLowerCase();
  if (req.body.password) data.password = await hashPassword(req.body.password);

  try {
    const user = await prisma.admin.update({ where: { id: existing.id }, data, select: safeAdminSelect });
    res.json({ success: true, message: 'Admin user updated.', user });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('Email or mobile number is already assigned.', 409);
    throw error;
  }
});

export const deactivateAdminUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError('You cannot deactivate your own account.', 409);
  const user = await prisma.admin.update({
    where: { id: req.params.id },
    data: { isActive: false },
    select: safeAdminSelect
  }).catch((error) => {
    if (error.code === 'P2025') throw new AppError('Admin user not found.', 404);
    throw error;
  });
  res.json({ success: true, message: 'Admin user deactivated.', user });
});
