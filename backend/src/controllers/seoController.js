import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SUPPORTED_TYPES = ['PAGE', 'PRODUCT', 'BLOG'];

function normalizeType(value) {
  const type = String(value || 'PAGE').trim().toUpperCase();
  if (!SUPPORTED_TYPES.includes(type)) {
    throw new AppError('SEO type must be PAGE, PRODUCT, or BLOG.', 400);
  }
  return type;
}

function paginationFrom(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  return { page, limit, skip: (page - 1) * limit };
}

function cleanOptional(value) {
  if (value === undefined) return undefined;
  const normalized = String(value || '').trim();
  return normalized || null;
}

function parseKeywords(value) {
  if (!value) return [];
  const keywords = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(keywords.map((keyword) => String(keyword).trim()).filter(Boolean))];
}

function normalizeRecord(type, record) {
  const title = type === 'PRODUCT' ? record.name : record.title;
  const ogImage = record.ogImage || (type === 'BLOG' ? record.coverImage || record.thumbnail : null);

  return {
    id: record.id,
    type,
    title,
    slug: record.slug,
    pageKey: record.pageKey || null,
    status: record.status,
    seoTitle: record.seoTitle || '',
    seoDescription: record.seoDescription || '',
    seoKeywords: record.seoKeywords || [],
    canonicalUrl: record.canonicalUrl || '',
    metaRobots: record.metaRobots || 'index,follow',
    ogImage: ogImage || '',
    optimized: Boolean(record.seoTitle?.trim() && record.seoDescription?.trim()),
    updatedAt: record.updatedAt
  };
}

function pageSelect() {
  return {
    id: true,
    title: true,
    slug: true,
    pageKey: true,
    status: true,
    seoTitle: true,
    seoDescription: true,
    seoKeywords: true,
    canonicalUrl: true,
    metaRobots: true,
    ogImage: true,
    updatedAt: true
  };
}

function productSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    status: true,
    seoTitle: true,
    seoDescription: true,
    seoKeywords: true,
    canonicalUrl: true,
    metaRobots: true,
    ogImage: true,
    updatedAt: true
  };
}

function blogSelect() {
  return {
    id: true,
    title: true,
    slug: true,
    status: true,
    seoTitle: true,
    seoDescription: true,
    seoKeywords: true,
    canonicalUrl: true,
    metaRobots: true,
    ogImage: true,
    coverImage: true,
    thumbnail: true,
    updatedAt: true
  };
}

async function listRecords(type, query, skip, take) {
  const search = String(query.search || '').trim();

  if (type === 'PAGE') {
    const where = search
      ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] }
      : {};
    return Promise.all([
      prisma.websitePage.findMany({ where, select: pageSelect(), orderBy: { updatedAt: 'desc' }, skip, take }),
      prisma.websitePage.count({ where })
    ]);
  }

  if (type === 'PRODUCT') {
    const where = {
      isDeleted: false,
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }]
      })
    };
    return Promise.all([
      prisma.product.findMany({ where, select: productSelect(), orderBy: { updatedAt: 'desc' }, skip, take }),
      prisma.product.count({ where })
    ]);
  }

  const where = {
    isDeleted: false,
    ...(search && {
      OR: [{ title: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }]
    })
  };
  return Promise.all([
    prisma.blog.findMany({ where, select: blogSelect(), orderBy: { updatedAt: 'desc' }, skip, take }),
    prisma.blog.count({ where })
  ]);
}

async function allRecords(type) {
  if (type === 'PAGE') return prisma.websitePage.findMany({ select: pageSelect() });
  if (type === 'PRODUCT') {
    return prisma.product.findMany({ where: { isDeleted: false }, select: productSelect() });
  }
  return prisma.blog.findMany({ where: { isDeleted: false }, select: blogSelect() });
}

export const getSeoSummary = asyncHandler(async (req, res) => {
  const groups = await Promise.all(SUPPORTED_TYPES.map(async (type) => [type, await allRecords(type)]));
  const summary = groups.map(([type, records]) => {
    const optimized = records.filter((record) => record.seoTitle?.trim() && record.seoDescription?.trim()).length;
    return { type, total: records.length, optimized, missing: records.length - optimized };
  });

  res.status(200).json({
    success: true,
    summary,
    totals: summary.reduce(
      (totals, item) => ({
        total: totals.total + item.total,
        optimized: totals.optimized + item.optimized,
        missing: totals.missing + item.missing
      }),
      { total: 0, optimized: 0, missing: 0 }
    )
  });
});

export const getSeoRecords = asyncHandler(async (req, res) => {
  const type = normalizeType(req.query.type);
  const { page, limit, skip } = paginationFrom(req.query);
  const [records, totalRecords] = await listRecords(type, req.query, skip, limit);

  res.status(200).json({
    success: true,
    type,
    currentPage: page,
    totalPages: Math.ceil(totalRecords / limit) || 1,
    totalRecords,
    records: records.map((record) => normalizeRecord(type, record))
  });
});

export const updateSeoRecord = asyncHandler(async (req, res) => {
  const type = normalizeType(req.params.type);
  const data = {
    ...(req.body.slug !== undefined && { slug: String(req.body.slug).trim().toLowerCase() }),
    ...(req.body.seoTitle !== undefined && { seoTitle: cleanOptional(req.body.seoTitle) }),
    ...(req.body.seoDescription !== undefined && { seoDescription: cleanOptional(req.body.seoDescription) }),
    ...(req.body.seoKeywords !== undefined && { seoKeywords: parseKeywords(req.body.seoKeywords) }),
    ...(req.body.canonicalUrl !== undefined && { canonicalUrl: cleanOptional(req.body.canonicalUrl) }),
    ...(req.body.metaRobots !== undefined && { metaRobots: cleanOptional(req.body.metaRobots) }),
    ...(req.body.ogImage !== undefined && { ogImage: cleanOptional(req.body.ogImage) })
  };

  let existing;
  if (type === 'PAGE') existing = await prisma.websitePage.findUnique({ where: { id: req.params.id } });
  if (type === 'PRODUCT') {
    existing = await prisma.product.findFirst({ where: { id: req.params.id, isDeleted: false } });
  }
  if (type === 'BLOG') existing = await prisma.blog.findFirst({ where: { id: req.params.id, isDeleted: false } });
  if (!existing) throw new AppError(`${type.toLowerCase()} SEO record not found.`, 404);

  try {
    let record;
    if (type === 'PAGE') {
      record = await prisma.websitePage.update({ where: { id: req.params.id }, data, select: pageSelect() });
    } else if (type === 'PRODUCT') {
      record = await prisma.product.update({ where: { id: req.params.id }, data, select: productSelect() });
    } else {
      record = await prisma.blog.update({ where: { id: req.params.id }, data, select: blogSelect() });
    }

    res.status(200).json({ success: true, record: normalizeRecord(type, record) });
  } catch (error) {
    if (error?.code === 'P2002') throw new AppError('That slug is already in use.', 409);
    throw error;
  }
});
