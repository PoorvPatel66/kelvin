import { PageStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function getPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPageWhere(query = {}) {
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { pageKey: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  return where;
}

function cleanOptionalString(value) {
  if (value === undefined) return undefined;
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

function parseStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPageData(body) {
  const data = {};

  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.slug !== undefined) data.slug = String(body.slug).trim().toLowerCase();
  if (body.pageKey !== undefined) data.pageKey = cleanOptionalString(body.pageKey);
  if (body.status !== undefined) data.status = body.status;
  if (body.excerpt !== undefined) data.excerpt = cleanOptionalString(body.excerpt);
  if (body.content !== undefined) data.content = cleanOptionalString(body.content);
  if (body.sections !== undefined) data.sections = body.sections;
  if (body.seoTitle !== undefined) data.seoTitle = cleanOptionalString(body.seoTitle);
  if (body.seoDescription !== undefined) data.seoDescription = cleanOptionalString(body.seoDescription);
  if (body.seoKeywords !== undefined) data.seoKeywords = parseStringArray(body.seoKeywords);
  if (body.canonicalUrl !== undefined) data.canonicalUrl = cleanOptionalString(body.canonicalUrl);
  if (body.metaRobots !== undefined) data.metaRobots = cleanOptionalString(body.metaRobots);
  if (body.ogImage !== undefined) data.ogImage = cleanOptionalString(body.ogImage);

  return data;
}

function handlePageConflict(error) {
  if (error.code === 'P2002') {
    throw new AppError('Page slug or page key already exists.', 409);
  }

  throw error;
}

const publicPageSelect = {
  title: true,
  slug: true,
  pageKey: true,
  excerpt: true,
  content: true,
  sections: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  canonicalUrl: true,
  metaRobots: true,
  ogImage: true,
  updatedAt: true
};

export const getPublishedPage = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier.trim().toLowerCase();
  const page = await prisma.websitePage.findFirst({
    where: {
      status: PageStatus.PUBLISHED,
      OR: [{ pageKey: identifier }, { slug: identifier }]
    },
    select: publicPageSelect
  });

  if (!page) {
    throw new AppError('Published website page not found.', 404);
  }

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({ success: true, page });
});

export const getAdminPages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildPageWhere(req.query);

  const [pages, totalPagesCount] = await Promise.all([
    prisma.websitePage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.websitePage.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalPagesCount / limit) || 1,
    totalWebsitePages: totalPagesCount,
    pages
  });
});

export const getAdminPageById = asyncHandler(async (req, res) => {
  const page = await prisma.websitePage.findUnique({
    where: { id: req.params.id }
  });

  if (!page) {
    throw new AppError('Website page not found.', 404);
  }

  res.status(200).json({
    success: true,
    page
  });
});

export const createAdminPage = asyncHandler(async (req, res) => {
  try {
    const page = await prisma.websitePage.create({
      data: buildPageData({
        status: PageStatus.DRAFT,
        ...req.body
      })
    });

    res.status(201).json({
      success: true,
      message: 'Website page created.',
      page
    });
  } catch (error) {
    handlePageConflict(error);
  }
});

export const updateAdminPage = asyncHandler(async (req, res) => {
  try {
    const page = await prisma.websitePage.update({
      where: { id: req.params.id },
      data: buildPageData(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Website page updated.',
      page
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Website page not found.', 404);
    }

    handlePageConflict(error);
  }
});

export const updateAdminPageStatus = asyncHandler(async (req, res) => {
  const page = await prisma.websitePage.update({
    where: { id: req.params.id },
    data: { status: req.body.status }
  });

  res.status(200).json({
    success: true,
    message: 'Website page status updated.',
    page
  });
});

export const publishAdminPage = asyncHandler(async (req, res) => {
  const page = await prisma.websitePage.update({
    where: { id: req.params.id },
    data: { status: PageStatus.PUBLISHED }
  });

  res.status(200).json({
    success: true,
    message: 'Website page published.',
    page
  });
});

export const draftAdminPage = asyncHandler(async (req, res) => {
  const page = await prisma.websitePage.update({
    where: { id: req.params.id },
    data: { status: PageStatus.DRAFT }
  });

  res.status(200).json({
    success: true,
    message: 'Website page moved to draft.',
    page
  });
});

export const deleteAdminPage = asyncHandler(async (req, res) => {
  try {
    await prisma.websitePage.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Website page deleted.'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Website page not found.', 404);
    }

    throw error;
  }
});
