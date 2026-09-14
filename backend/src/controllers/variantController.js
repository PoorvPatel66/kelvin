import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function variantData(body) {
  const fields = ['productId', 'name', 'sku', 'size', 'material', 'color', 'moq', 'specifications', 'status', 'sortOrder'];
  return Object.fromEntries(
    fields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field] === '' ? null : body[field]])
  );
}

export const getVariants = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const where = { isDeleted: false };
  if (req.query.productId) where.productId = req.query.productId;
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { sku: { contains: req.query.search, mode: 'insensitive' } },
      { size: { contains: req.query.search, mode: 'insensitive' } }
    ];
  }

  const [variants, totalVariants] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ product: { name: 'asc' } }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    }),
    prisma.productVariant.count({ where })
  ]);

  res.json({ success: true, variants, currentPage: page, totalPages: Math.ceil(totalVariants / limit) || 1, totalVariants });
});

export const createVariant = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { id: req.body.productId, isDeleted: false }, select: { id: true } });
  if (!product) throw new AppError('Valid product is required.', 400);

  try {
    const variant = await prisma.productVariant.create({
      data: variantData(req.body),
      include: { product: { select: { id: true, name: true, slug: true } } }
    });
    res.status(201).json({ success: true, message: 'Product variant created.', variant });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('Variant SKU already exists.', 409);
    throw error;
  }
});

export const updateVariant = asyncHandler(async (req, res) => {
  const existing = await prisma.productVariant.findFirst({ where: { id: req.params.id, isDeleted: false }, select: { id: true } });
  if (!existing) throw new AppError('Product variant not found.', 404);

  try {
    const variant = await prisma.productVariant.update({
      where: { id: existing.id },
      data: variantData(req.body),
      include: { product: { select: { id: true, name: true, slug: true } } }
    });
    res.json({ success: true, message: 'Product variant updated.', variant });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError('Variant SKU already exists.', 409);
    throw error;
  }
});

export const deleteVariant = asyncHandler(async (req, res) => {
  const existing = await prisma.productVariant.findFirst({ where: { id: req.params.id, isDeleted: false }, select: { id: true } });
  if (!existing) throw new AppError('Product variant not found.', 404);

  await prisma.productVariant.update({
    where: { id: existing.id },
    data: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }
  });
  res.json({ success: true, message: 'Product variant archived.' });
});
