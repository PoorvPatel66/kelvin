import { BlogStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { generateSlug } from '../utils/slugify.js';

function parseBoolean(value) {
  return value === true || value === 'true';
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

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function getPublishedFields(status) {
  const isPublished = status === BlogStatus.PUBLISHED;
  const isScheduled = status === BlogStatus.SCHEDULED;

  return {
    status,
    published: isPublished,
    publishedAt: isPublished ? new Date() : null,
    scheduledAt: isScheduled ? undefined : null
  };
}

function getStatusFields(status, scheduledAt) {
  if (status === BlogStatus.SCHEDULED) {
    return {
      status,
      published: false,
      publishedAt: null,
      scheduledAt
    };
  }

  return {
    ...getPublishedFields(status),
    scheduledAt: null
  };
}

async function updateStatusById(id, status) {
  return prisma.blog.update({
    where: { id },
    data: getStatusFields(status, null),
    include: includeBlogRelations()
  });
}

function includeBlogRelations() {
  return {
    admin: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    category: true,
    relatedFrom: {
      include: {
        related: {
          include: {
            category: true
          }
        }
      }
    }
  };
}

function buildPublicWhere(query) {
  const where = {
    isDeleted: false,
    status: BlogStatus.PUBLISHED,
    published: true
  };

  if (query.featured !== undefined) {
    where.featured = parseBoolean(query.featured);
  }

  if (query.category) {
    where.category = {
      slug: query.category
    };
  }

  if (query.tag) {
    where.tags = {
      has: query.tag
    };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
      { tags: { has: query.search } },
      {
        category: {
          name: { contains: query.search, mode: 'insensitive' }
        }
      }
    ];
  }

  return where;
}

function buildAdminWhere(query) {
  const where = {
    isDeleted: query.trash === true || query.trash === 'true'
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.featured !== undefined) {
    where.featured = parseBoolean(query.featured);
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.category) {
    where.category = {
      slug: query.category
    };
  }

  if (query.tag) {
    where.tags = {
      has: query.tag
    };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
      { tags: { has: query.search } },
      {
        category: {
          name: { contains: query.search, mode: 'insensitive' }
        }
      }
    ];
  }

  return where;
}

async function publishDueBlogs() {
  await prisma.blog.updateMany({
    where: {
      isDeleted: false,
      status: BlogStatus.SCHEDULED,
      scheduledAt: {
        lte: new Date()
      }
    },
    data: {
      status: BlogStatus.PUBLISHED,
      published: true,
      publishedAt: new Date(),
      scheduledAt: null
    }
  });
}

async function ensureBlogCategory(categoryId) {
  if (!categoryId) {
    return;
  }

  const category = await prisma.blogCategory.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new AppError('Invalid blog category.', 400);
  }
}

async function buildBlogImageData(file) {
  if (!file) {
    return {};
  }

  const uploaded = await uploadBufferToCloudinary(file, 'kelvin/blogs');

  return {
    thumbnail: uploaded.url,
    thumbnailPublicId: uploaded.publicId
  };
}

export const getBlogs = asyncHandler(async (req, res) => {
  await publishDueBlogs();
  const { page, limit, skip } = getPagination(req.query);
  const where = buildPublicWhere(req.query);

  const [blogs, totalBlogs] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: includeBlogRelations(),
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    }),
    prisma.blog.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit) || 1,
    totalBlogs,
    blogs
  });
});

export const getAdminBlogs = asyncHandler(async (req, res) => {
  await publishDueBlogs();
  const { page, limit, skip } = getPagination(req.query);
  const where = buildAdminWhere(req.query);

  const [blogs, totalBlogs] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: includeBlogRelations(),
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.blog.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit) || 1,
    totalBlogs,
    blogs
  });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  await publishDueBlogs();
  const blog = await prisma.blog.findFirst({
    where: {
      slug: req.params.slug,
      isDeleted: false,
      status: BlogStatus.PUBLISHED,
      published: true
    },
    include: includeBlogRelations()
  });

  if (!blog) {
    throw new AppError('Blog not found.', 404);
  }

  res.status(200).json({
    success: true,
    blog
  });
});

export const getAdminBlogById = asyncHandler(async (req, res) => {
  await publishDueBlogs();
  const blog = await prisma.blog.findFirst({
    where: {
      id: req.params.id,
      isDeleted: false
    },
    include: includeBlogRelations()
  });

  if (!blog) {
    throw new AppError('Blog not found.', 404);
  }

  res.status(200).json({
    success: true,
    blog
  });
});

export const createBlog = asyncHandler(async (req, res) => {
  await ensureBlogCategory(req.body.categoryId);

  const status = req.body.status || BlogStatus.DRAFT;
  const scheduledAt = parseDate(req.body.scheduledAt);
  const imageData = await buildBlogImageData(req.file);
  const slug = req.body.slug || generateSlug(req.body.title);

  const blog = await prisma.blog.create({
    data: {
      title: req.body.title,
      slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      contentFormat: req.body.contentFormat || 'MARKDOWN',
      ...imageData,
      featured: parseBoolean(req.body.featured),
      ...getStatusFields(status, scheduledAt),
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      seoKeywords: parseStringArray(req.body.seoKeywords),
      canonicalUrl: req.body.canonicalUrl,
      metaRobots: req.body.metaRobots,
      ogImage: req.body.ogImage,
      tags: parseStringArray(req.body.tags),
      categoryId: req.body.categoryId,
      adminId: req.user.id
    },
    include: includeBlogRelations()
  });

  res.status(201).json({
    success: true,
    blog
  });
});

export const updateBlog = asyncHandler(async (req, res) => {
  if (req.body.categoryId) {
    await ensureBlogCategory(req.body.categoryId);
  }

  const imageData = await buildBlogImageData(req.file);
  const statusFields = req.body.status
    ? getStatusFields(req.body.status, parseDate(req.body.scheduledAt))
    : {};

  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.slug && { slug: req.body.slug }),
      ...(!req.body.slug && req.body.title && { slug: generateSlug(req.body.title) }),
      ...(req.body.excerpt && { excerpt: req.body.excerpt }),
      ...(req.body.content && { content: req.body.content }),
      ...(req.body.contentFormat && { contentFormat: req.body.contentFormat }),
      ...imageData,
      ...(req.body.featured !== undefined && { featured: parseBoolean(req.body.featured) }),
      ...statusFields,
      ...(req.body.seoTitle !== undefined && { seoTitle: req.body.seoTitle }),
      ...(req.body.seoDescription !== undefined && { seoDescription: req.body.seoDescription }),
      ...(req.body.seoKeywords !== undefined && { seoKeywords: parseStringArray(req.body.seoKeywords) }),
      ...(req.body.canonicalUrl !== undefined && { canonicalUrl: req.body.canonicalUrl }),
      ...(req.body.metaRobots !== undefined && { metaRobots: req.body.metaRobots }),
      ...(req.body.ogImage !== undefined && { ogImage: req.body.ogImage || null }),
      ...(req.body.tags !== undefined && { tags: parseStringArray(req.body.tags) }),
      ...(req.body.categoryId !== undefined && { categoryId: req.body.categoryId }),
      ...(req.body.scheduledAt !== undefined && !req.body.status && { scheduledAt: parseDate(req.body.scheduledAt) })
    },
    include: includeBlogRelations()
  });

  res.status(200).json({
    success: true,
    blog
  });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  await prisma.blog.update({
    where: { id: req.params.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: BlogStatus.ARCHIVED,
      published: false
    }
  });

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully.'
  });
});

export const updateBlogStatus = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: getStatusFields(req.body.status, parseDate(req.body.scheduledAt)),
    include: includeBlogRelations()
  });

  res.status(200).json({
    success: true,
    blog
  });
});

export const publishBlog = asyncHandler(async (req, res) => {
  const blog = await updateStatusById(req.params.id, BlogStatus.PUBLISHED);

  res.status(200).json({
    success: true,
    blog
  });
});

export const draftBlog = asyncHandler(async (req, res) => {
  const blog = await updateStatusById(req.params.id, BlogStatus.DRAFT);

  res.status(200).json({
    success: true,
    blog
  });
});

export const restoreBlog = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: BlogStatus.DRAFT,
      published: false,
      publishedAt: null,
      scheduledAt: null
    },
    include: includeBlogRelations()
  });

  res.status(200).json({
    success: true,
    blog
  });
});

export const permanentlyDeleteBlog = asyncHandler(async (req, res) => {
  await prisma.blog.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    message: 'Blog permanently deleted successfully.'
  });
});

export const setFeaturedBlog = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: {
      featured: parseBoolean(req.body.featured)
    },
    include: includeBlogRelations()
  });

  res.status(200).json({
    success: true,
    blog
  });
});

export const setRelatedArticles = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.findFirst({
    where: {
      id: req.params.id,
      isDeleted: false
    }
  });

  if (!blog) {
    throw new AppError('Blog not found.', 404);
  }

  const relatedIds = [...new Set(req.body.relatedIds)].filter((id) => id !== req.params.id);

  if (relatedIds.length) {
    const existingRelatedCount = await prisma.blog.count({
      where: {
        id: { in: relatedIds },
        isDeleted: false
      }
    });

    if (existingRelatedCount !== relatedIds.length) {
      throw new AppError('One or more related articles are invalid.', 400);
    }
  }

  await prisma.$transaction([
    prisma.blogRelatedArticle.deleteMany({
      where: { blogId: req.params.id }
    }),
    ...relatedIds.map((relatedId) =>
      prisma.blogRelatedArticle.create({
        data: {
          blogId: req.params.id,
          relatedId
        }
      })
    )
  ]);

  const updatedBlog = await prisma.blog.findUnique({
    where: { id: req.params.id },
    include: includeBlogRelations()
  });

  res.status(200).json({
    success: true,
    blog: updatedBlog
  });
});

export const createBlogCategory = asyncHandler(async (req, res) => {
  const category = await prisma.blogCategory.create({
    data: {
      name: req.body.name,
      slug: req.body.slug || generateSlug(req.body.name),
      description: req.body.description,
      status: req.body.status || BlogStatus.PUBLISHED
    }
  });

  res.status(201).json({
    success: true,
    category
  });
});

export const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { blogs: true }
      }
    }
  });

  res.status(200).json({
    success: true,
    categories
  });
});

export const updateBlogCategory = asyncHandler(async (req, res) => {
  const category = await prisma.blogCategory.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.slug && { slug: req.body.slug }),
      ...(!req.body.slug && req.body.name && { slug: generateSlug(req.body.name) }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.status && { status: req.body.status })
    }
  });

  res.status(200).json({
    success: true,
    category
  });
});

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  await prisma.blogCategory.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    message: 'Blog category deleted successfully.'
  });
});
