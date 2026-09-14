import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateSlug } from '../utils/slugify.js';

function catalogData(body) {
  const fields = ['title', 'description', 'fileUrl', 'publicId', 'thumbnailUrl', 'version', 'status', 'featured', 'sortOrder'];
  const data = Object.fromEntries(
    fields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field] === '' ? null : body[field]])
  );
  if (body.slug !== undefined || body.title) data.slug = generateSlug(body.slug || body.title);
  if (data.status === 'PUBLISHED') data.publishedAt = new Date();
  return data;
}

export const getPublicCatalogs = asyncHandler(async (req, res) => {
  const catalogs = await prisma.catalog.findMany({
    where: { status: 'PUBLISHED', isDeleted: false },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }]
  });
  res.json({ success: true, catalogs });
});

export const getCatalogs = asyncHandler(async (req, res) => {
  const where = { isDeleted: false };
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.OR = [
    { title: { contains: req.query.search, mode: 'insensitive' } },
    { description: { contains: req.query.search, mode: 'insensitive' } },
    { version: { contains: req.query.search, mode: 'insensitive' } }
  ];

  const catalogs = await prisma.catalog.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] });
  res.json({ success: true, catalogs, totalCatalogs: catalogs.length });
});

export const createCatalog = asyncHandler(async (req, res) => {
  try {
    const catalog = await prisma.catalog.create({ data: catalogData(req.body) });
    res.status(201).json({ success: true, message: 'Catalog created.', catalog });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('Catalog slug already exists.', 409);
    throw error;
  }
});

export const updateCatalog = asyncHandler(async (req, res) => {
  const existing = await prisma.catalog.findFirst({ where: { id: req.params.id, isDeleted: false }, select: { id: true } });
  if (!existing) throw new AppError('Catalog not found.', 404);

  try {
    const catalog = await prisma.catalog.update({ where: { id: existing.id }, data: catalogData(req.body) });
    res.json({ success: true, message: 'Catalog updated.', catalog });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('Catalog slug already exists.', 409);
    throw error;
  }
});

export const deleteCatalog = asyncHandler(async (req, res) => {
  const existing = await prisma.catalog.findFirst({ where: { id: req.params.id, isDeleted: false }, select: { id: true } });
  if (!existing) throw new AppError('Catalog not found.', 404);
  await prisma.catalog.update({ where: { id: existing.id }, data: { isDeleted: true, deletedAt: new Date(), status: 'ARCHIVED' } });
  res.json({ success: true, message: 'Catalog archived.' });
});
