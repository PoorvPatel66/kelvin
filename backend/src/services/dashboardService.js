import { prisma } from '../config/prisma.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEFAULT_CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

function clampNumber(value, fallback, min, max) {
  const numberValue = Number.parseInt(value, 10);

  if (Number.isNaN(numberValue)) {
    return fallback;
  }

  return Math.min(Math.max(numberValue, min), max);
}

function getCacheKey(name, params = {}) {
  return `${name}:${JSON.stringify(params)}`;
}

function readCache(key) {
  const entry = cache.get(key);

  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function writeCache(key, value, ttl = DEFAULT_CACHE_TTL_MS) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  });

  return value;
}

async function withCache(key, producer, ttl) {
  const cachedValue = readCache(key);

  if (cachedValue) {
    return cachedValue;
  }

  const value = await producer();
  return writeCache(key, value, ttl);
}

export function getPagination(query, defaultLimit = 10, maxLimit = 50) {
  const page = clampNumber(query.page, 1, 1, 100000);
  const limit = clampNumber(query.limit, defaultLimit, 1, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export async function getDashboardSummary() {
  return withCache('dashboard:summary', async () => {
    const [products, blogs, inquiries, categories, customers, quotations, catalogs, adminUsers] = await Promise.all([
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.blog.count({ where: { isDeleted: false } }),
      prisma.inquiry.count(),
      prisma.category.count({ where: { isDeleted: false } }),
      prisma.customer.count({ where: { isDeleted: false } }),
      prisma.quotation.count(),
      prisma.catalog.count({ where: { isDeleted: false } }),
      prisma.admin.count({ where: { isActive: true } })
    ]);

    return { products, blogs, inquiries, categories, customers, quotations, catalogs, adminUsers };
  });
}

export async function getMonthlyInquiryStats(year = new Date().getFullYear()) {
  const selectedYear = clampNumber(year, new Date().getFullYear(), 2000, 2100);
  const cacheKey = getCacheKey('dashboard:monthly-inquiries', { year: selectedYear });

  return withCache(cacheKey, async () => {
    const startDate = new Date(Date.UTC(selectedYear, 0, 1));
    const endDate = new Date(Date.UTC(selectedYear + 1, 0, 1));
    const monthlyStats = MONTH_LABELS.map((month) => ({ month, count: 0 }));

    const inquiries = await prisma.inquiry.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        createdAt: true
      }
    });

    inquiries.forEach((inquiry) => {
      const monthIndex = inquiry.createdAt.getUTCMonth();
      monthlyStats[monthIndex].count += 1;
    });

    return {
      year: selectedYear,
      months: monthlyStats
    };
  });
}

export async function getLatestInquiries(query = {}) {
  const { page, limit, skip } = getPagination(query, 10, 50);
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  const [totalInquiries, inquiries] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        country: true,
        product: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    currentPage: page,
    totalPages: Math.ceil(totalInquiries / limit) || 1,
    totalInquiries,
    inquiries
  };
}

export async function getRecentBlogs(query = {}) {
  const { page, limit, skip } = getPagination(query, 5, 50);
  const where = { isDeleted: false };

  const [totalBlogs, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        featured: true,
        status: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
  ]);

  return {
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit) || 1,
    totalBlogs,
    blogs
  };
}

export async function getFeaturedProducts(query = {}) {
  const { page, limit, skip } = getPagination(query, 6, 50);
  const where = {
    featured: true,
    isDeleted: false
  };

  const [totalProducts, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        material: true,
        sizes: true,
        status: true,
        featured: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            url: true,
            publicId: true
          }
        }
      }
    })
  ]);

  return {
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit) || 1,
    totalProducts,
    products
  };
}

export async function globalSearch(query = {}) {
  const searchTerm = String(query.q || query.search || '').trim();
  const { page, limit, skip } = getPagination(query, 10, 25);

  if (!searchTerm) {
    return {
      query: searchTerm,
      currentPage: page,
      limit,
      totalResults: 0,
      products: [],
      blogs: [],
      inquiries: []
    };
  }

  const productWhere = {
    isDeleted: false,
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { slug: { contains: searchTerm, mode: 'insensitive' } },
      { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
      { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  };

  const blogWhere = {
    isDeleted: false,
    OR: [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { slug: { contains: searchTerm, mode: 'insensitive' } },
      { excerpt: { contains: searchTerm, mode: 'insensitive' } }
    ]
  };

  const inquiryWhere = {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { company: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { country: { contains: searchTerm, mode: 'insensitive' } },
      { product: { contains: searchTerm, mode: 'insensitive' } },
      { message: { contains: searchTerm, mode: 'insensitive' } }
    ]
  };

  const [productCount, blogCount, inquiryCount, products, blogs, inquiries] = await Promise.all([
    prisma.product.count({ where: productWhere }),
    prisma.blog.count({ where: blogWhere }),
    prisma.inquiry.count({ where: inquiryWhere }),
    prisma.product.findMany({
      where: productWhere,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        status: true,
        featured: true,
        category: { select: { name: true, slug: true } }
      }
    }),
    prisma.blog.findMany({
      where: blogWhere,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        featured: true,
        published: true
      }
    }),
    prisma.inquiry.findMany({
      where: inquiryWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        country: true,
        product: true,
        status: true,
        createdAt: true
      }
    })
  ]);

  return {
    query: searchTerm,
    currentPage: page,
    limit,
    totalResults: productCount + blogCount + inquiryCount,
    products: {
      total: productCount,
      data: products
    },
    blogs: {
      total: blogCount,
      data: blogs
    },
    inquiries: {
      total: inquiryCount,
      data: inquiries
    }
  };
}

export async function getVisitorsAnalytics(query = {}) {
  const year = clampNumber(query.year, new Date().getFullYear(), 2000, 2100);
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));
  const startOfMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));

  const [totalVisitors, monthlyVisitors, visits, topPages, topSources] = await Promise.all([
    prisma.visitorAnalytics.count(),
    prisma.visitorAnalytics.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.visitorAnalytics.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear
        }
      },
      select: {
        createdAt: true
      }
    }),
    prisma.visitorAnalytics.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10
    }),
    prisma.visitorAnalytics.groupBy({
      by: ['source'],
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } },
      take: 10
    })
  ]);

  const monthlyStats = MONTH_LABELS.map((month) => ({ month, count: 0 }));

  visits.forEach((visit) => {
    monthlyStats[visit.createdAt.getUTCMonth()].count += 1;
  });

  return {
    totalVisitors,
    currentMonthVisitors: monthlyVisitors,
    year,
    monthly: monthlyStats,
    topPages: topPages.map((page) => ({
      path: page.path,
      count: page._count.path
    })),
    topSources: topSources.map((source) => ({
      source: source.source || 'Direct',
      count: source._count.source
    }))
  };
}
