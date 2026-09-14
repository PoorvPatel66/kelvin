import { ProductStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

function parseJson(value) {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new AppError('Specifications must be valid JSON.', 400);
  }
}

function parseStringArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value) {
  return value === true || value === 'true';
}

function getPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildProductWhere(query, options = {}) {
  const where = {
    isDeleted: options.deletedOnly ? true : false
  };

  if (!options.includeInactive) {
    where.status = ProductStatus.ACTIVE;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.featured !== undefined) {
    where.featured = query.featured === 'true' || query.featured === true;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.category) {
    where.category = {
      slug: query.category
    };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      {
        category: {
          name: { contains: query.search, mode: 'insensitive' }
        }
      },
      {
        category: {
          slug: { contains: query.search, mode: 'insensitive' }
        }
      }
    ];
  }

  return where;
}

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      isDeleted: false
    }
  });

  if (!category) {
    throw new AppError('Invalid category.', 400);
  }
}

async function uploadProductImages(files = []) {
  if (files.length > 10) {
    throw new AppError('You can upload up to 10 product images.', 400);
  }

  const uploadedImages = [];

  for (const file of files) {
    uploadedImages.push(await uploadBufferToCloudinary(file, 'kelvin/products'));
  }

  return uploadedImages;
}

export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildProductWhere(req.query);

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: { where: { isDeleted: false, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } }
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit) || 1,
    totalProducts,
    products
  });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildProductWhere(req.query, {
    includeInactive: true,
    deletedOnly: req.query.trash === 'true'
  });

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit) || 1,
    totalProducts,
    products
  });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      featured: true,
      isDeleted: false
    },
    include: {
      category: true,
      images: true,
      variants: { where: { isDeleted: false, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  res.status(200).json({
    success: true,
    products
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      slug: req.params.slug,
      status: ProductStatus.ACTIVE,
      isDeleted: false
    },
    include: {
      category: true,
      images: true,
      variants: { where: { isDeleted: false, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } }
    }
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    success: true,
    product
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.categoryId);

  const uploadedImages = await uploadProductImages(req.files || []);

  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      specifications: parseJson(req.body.specifications),
      moq: req.body.moq,
      material: req.body.material,
      sizes: parseStringArray(req.body.sizes),
      capacity: req.body.capacity,
      usage: req.body.usage,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      seoKeywords: parseStringArray(req.body.seoKeywords),
      canonicalUrl: req.body.canonicalUrl,
      metaRobots: req.body.metaRobots,
      ogImage: req.body.ogImage,
      status: req.body.status || ProductStatus.ACTIVE,
      featured: parseBoolean(req.body.featured),
      categoryId: req.body.categoryId,
      images: {
        create: uploadedImages.map((image) => ({
          url: image.url,
          publicId: image.publicId
        }))
      }
    },
    include: {
      category: true,
      images: true,
      variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } }
    }
  });

  res.status(201).json({
    success: true,
    product
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.categoryId) {
    await assertCategoryExists(req.body.categoryId);
  }

  const uploadedImages = await uploadProductImages(req.files || []);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name !== undefined && { name: req.body.name }),
      ...(req.body.slug !== undefined && { slug: req.body.slug }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.shortDescription !== undefined && { shortDescription: req.body.shortDescription }),
      ...(req.body.specifications !== undefined && { specifications: parseJson(req.body.specifications) }),
      ...(req.body.moq !== undefined && { moq: req.body.moq || null }),
      ...(req.body.material !== undefined && { material: req.body.material || null }),
      ...(req.body.sizes !== undefined && { sizes: parseStringArray(req.body.sizes) }),
      ...(req.body.capacity !== undefined && { capacity: req.body.capacity || null }),
      ...(req.body.usage !== undefined && { usage: req.body.usage || null }),
      ...(req.body.seoTitle !== undefined && { seoTitle: req.body.seoTitle || null }),
      ...(req.body.seoDescription !== undefined && { seoDescription: req.body.seoDescription || null }),
      ...(req.body.seoKeywords !== undefined && { seoKeywords: parseStringArray(req.body.seoKeywords) }),
      ...(req.body.canonicalUrl !== undefined && { canonicalUrl: req.body.canonicalUrl || null }),
      ...(req.body.metaRobots !== undefined && { metaRobots: req.body.metaRobots || null }),
      ...(req.body.ogImage !== undefined && { ogImage: req.body.ogImage || null }),
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.featured !== undefined && { featured: parseBoolean(req.body.featured) }),
      ...(req.body.categoryId && { categoryId: req.body.categoryId }),
      ...(uploadedImages.length && {
        images: {
          create: uploadedImages.map((image) => ({
            url: image.url,
            publicId: image.publicId
          }))
        }
      })
    },
    include: {
      category: true,
      images: true,
      variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } }
    }
  });

  res.status(200).json({
    success: true,
    product
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: ProductStatus.INACTIVE
    }
  });

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.'
  });
});

export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: ProductStatus.INACTIVE
    },
    include: { category: true, images: true, variants: true }
  });

  res.status(200).json({ success: true, product, message: 'Product restored as inactive.' });
});

export const duplicateProduct = asyncHandler(async (req, res) => {
  const source = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true, variants: { where: { isDeleted: false } } }
  });

  if (!source) throw new AppError('Product not found.', 404);

  const baseSlug = `${source.slug}-copy`;
  let slug = baseSlug;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const product = await prisma.product.create({
    data: {
      name: `${source.name} Copy`,
      slug,
      description: source.description,
      shortDescription: source.shortDescription,
      specifications: source.specifications,
      moq: source.moq,
      material: source.material,
      sizes: source.sizes,
      capacity: source.capacity,
      usage: source.usage,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      seoKeywords: source.seoKeywords,
      canonicalUrl: null,
      metaRobots: 'noindex,nofollow',
      ogImage: source.ogImage,
      status: ProductStatus.DRAFT,
      featured: false,
      categoryId: source.categoryId,
      images: {
        create: source.images.map((image) => ({ url: image.url, publicId: image.publicId }))
      },
      variants: {
        create: source.variants.map((variant) => ({
          name: variant.name,
          sku: null,
          size: variant.size,
          material: variant.material,
          color: variant.color,
          moq: variant.moq,
          specifications: variant.specifications,
          status: ProductStatus.DRAFT,
          sortOrder: variant.sortOrder
        }))
      }
    },
    include: { category: true, images: true, variants: true }
  });

  res.status(201).json({ success: true, product, message: 'Product duplicated as draft.' });
});

export const permanentlyDeleteProduct = asyncHandler(async (req, res) => {
  const quotationItemCount = await prisma.quotationItem.count({ where: { productId: req.params.id } });
  if (quotationItemCount > 0) {
    throw new AppError('This product is referenced by quotations and cannot be permanently deleted.', 409);
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.productVariant.deleteMany({ where: { productId: req.params.id } });
    await transaction.productImage.deleteMany({ where: { productId: req.params.id } });
    await transaction.product.delete({ where: { id: req.params.id } });
  });

  res.status(200).json({ success: true, message: 'Product permanently deleted.' });
});

export const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, action, status, featured } = req.body;
  const where = { id: { in: ids } };

  if (action === 'permanent-delete') {
    const referenced = await prisma.quotationItem.count({ where: { productId: { in: ids } } });
    if (referenced > 0) {
      throw new AppError('One or more selected products are referenced by quotations.', 409);
    }
    await prisma.$transaction(async (transaction) => {
      await transaction.productVariant.deleteMany({ where: { productId: { in: ids } } });
      await transaction.productImage.deleteMany({ where: { productId: { in: ids } } });
      await transaction.product.deleteMany({ where });
    });
  } else {
    const dataByAction = {
      delete: { isDeleted: true, deletedAt: new Date(), status: ProductStatus.INACTIVE },
      restore: { isDeleted: false, deletedAt: null, status: ProductStatus.INACTIVE },
      status: { status },
      featured: { featured }
    };
    await prisma.product.updateMany({ where, data: dataByAction[action] });
  }

  res.status(200).json({ success: true, affected: ids.length, message: 'Bulk action completed.' });
});
