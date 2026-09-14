import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function dataFrom(body) {
  const data = {};
  for (const key of ['label', 'path', 'area', 'sortOrder', 'isVisible', 'isExternal']) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (data.label) data.label = data.label.trim();
  if (data.path) data.path = data.path.trim();
  return data;
}

export const getPublicNavigation = asyncHandler(async (req, res) => {
  const items = await prisma.navigationItem.findMany({
    where: { isVisible: true },
    orderBy: [{ area: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }]
  });
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({ success: true, items });
});

export const getAdminNavigation = asyncHandler(async (req, res) => {
  const items = await prisma.navigationItem.findMany({ orderBy: [{ area: 'asc' }, { sortOrder: 'asc' }] });
  res.status(200).json({ success: true, items });
});

export const createNavigationItem = asyncHandler(async (req, res) => {
  try {
    const item = await prisma.navigationItem.create({ data: dataFrom(req.body) });
    res.status(201).json({ success: true, message: 'Navigation item created.', item });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('This path already exists in that navigation area.', 409);
    throw error;
  }
});

export const updateNavigationItem = asyncHandler(async (req, res) => {
  try {
    const item = await prisma.navigationItem.update({ where: { id: req.params.id }, data: dataFrom(req.body) });
    res.status(200).json({ success: true, message: 'Navigation item updated.', item });
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('Navigation item not found.', 404);
    if (error.code === 'P2002') throw new AppError('This path already exists in that navigation area.', 409);
    throw error;
  }
});

export const deleteNavigationItem = asyncHandler(async (req, res) => {
  try {
    await prisma.navigationItem.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Navigation item deleted.' });
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('Navigation item not found.', 404);
    throw error;
  }
});
