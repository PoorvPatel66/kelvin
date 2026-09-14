import { ProductStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function buildCategoryWhere(query, includeInactive = false) {
  const where = {
    isDeleted: includeInactive && (query.trash === true || query.trash === 'true') ? true : false
  };

  if (!includeInactive) {
    where.status = ProductStatus.ACTIVE;
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

async function ensureParentCategory(parentId, categoryId) {
  if (!parentId) return null;

  if (parentId === categoryId) {
    throw new AppError('A category cannot be its own parent.', 400);
  }

  const parent = await prisma.category.findFirst({
    where: { id: parentId, isDeleted: false }
  });

  if (!parent) {
    throw new AppError('Parent category not found.', 400);
  }

  return parent.id;
}

function categoryData(body) {
  return {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.slug !== undefined && { slug: body.slug }),
    ...(body.description !== undefined && { description: body.description || null }),
    ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
    ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    ...(body.parentId !== undefined && { parentId: body.parentId || null }),
    ...(body.status !== undefined && { status: body.status })
  };
}

const categoryInclude = {
  parent: {
    select: { id: true, name: true, slug: true }
  },
  children: {
    where: { isDeleted: false },
    select: { id: true, name: true, slug: true, sortOrder: true, status: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  },
  _count: {
    select: { products: true, children: true }
  }
};

export const createCategory = asyncHandler(async (req, res) => {
  await ensureParentCategory(req.body.parentId);

  const category = await prisma.category.create({
    data: {
      ...categoryData(req.body),
      status: req.body.status || ProductStatus.ACTIVE
    },
    include: categoryInclude
  });

  res.status(201).json({
    success: true,
    category
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: buildCategoryWhere(req.query),
    include: categoryInclude,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  res.status(200).json({
    success: true,
    categories
  });
});

export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: buildCategoryWhere(req.query, true),
    include: categoryInclude,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });

  res.status(200).json({
    success: true,
    categories
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  if (req.body.parentId !== undefined) {
    await ensureParentCategory(req.body.parentId, req.params.id);
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: categoryData(req.body),
    include: categoryInclude
  });

  res.status(200).json({
    success: true,
    category
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: req.params.id, isDeleted: false } }),
    prisma.category.count({ where: { parentId: req.params.id, isDeleted: false } })
  ]);

  if (productCount > 0) {
    throw new AppError('Category cannot be deleted while active products are assigned.', 400);
  }

  if (childCount > 0) {
    throw new AppError('Move or delete child categories before deleting this category.', 400);
  }

  await prisma.category.update({
    where: { id: req.params.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: ProductStatus.INACTIVE
    }
  });

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.'
  });
});

export const restoreCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: ProductStatus.ACTIVE
    },
    include: categoryInclude
  });

  res.status(200).json({ success: true, category, message: 'Category restored successfully.' });
});

export const permanentlyDeleteCategory = asyncHandler(async (req, res) => {
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: req.params.id } }),
    prisma.category.count({ where: { parentId: req.params.id } })
  ]);

  if (productCount > 0 || childCount > 0) {
    throw new AppError('Category still has products or child categories and cannot be permanently deleted.', 409);
  }

  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Category permanently deleted.' });
});
