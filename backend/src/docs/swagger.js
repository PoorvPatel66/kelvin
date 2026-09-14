export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Kelvin Eco Products API',
    version: '1.0.0',
    description: 'Enterprise B2B product management API for Kelvin Eco Products.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development'
    }
  ],
  tags: [
    { name: 'Products' },
    { name: 'Categories' },
    { name: 'Admin Products' },
    { name: 'Admin Categories' },
    { name: 'Blogs' },
    { name: 'Admin Blog CMS' },
    { name: 'Inquiries' },
    { name: 'Admin Inquiries' },
    { name: 'Admin Dashboard' },
    { name: 'Admin Media' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      CategoryInput: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string', example: 'Paper Packaging' },
          slug: { type: 'string', example: 'paper-packaging' },
          description: { type: 'string', example: 'Eco-friendly paper packaging products.' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], example: 'ACTIVE' }
        }
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'slug', 'shortDescription', 'description', 'categoryId', 'moq'],
        properties: {
          name: { type: 'string', example: 'Paper Cups' },
          slug: { type: 'string', example: 'paper-cups' },
          shortDescription: { type: 'string', example: 'Hot and cold paper cups.' },
          description: { type: 'string', example: 'Premium paper cups for cafes and chains.' },
          material: { type: 'string', example: 'Food-grade paper' },
          sizes: { type: 'string', example: '100 ml,150 ml,250 ml' },
          capacity: { type: 'string', example: '100 ml to 350 ml' },
          moq: { type: 'string', example: '50000 pieces' },
          specifications: {
            type: 'string',
            example: '{"printing":"Single and multi-color","useCase":"Hot beverages"}'
          },
          usage: { type: 'string', example: 'Coffee, tea, juice, and takeaway beverages' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], example: 'ACTIVE' },
          featured: { type: 'boolean', example: true },
          categoryId: { type: 'string', format: 'uuid' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            maxItems: 10
          }
        }
      },
      BlogInput: {
        type: 'object',
        required: ['title', 'excerpt', 'content'],
        properties: {
          title: { type: 'string', example: 'Why Eco-Friendly Packaging Matters' },
          slug: { type: 'string', example: 'why-eco-friendly-packaging-matters' },
          excerpt: { type: 'string', example: 'A short summary for listing pages.' },
          content: { type: 'string', example: '## Markdown heading\\nLong blog content...' },
          contentFormat: { type: 'string', enum: ['MARKDOWN', 'RICH_TEXT'], example: 'MARKDOWN' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], example: 'DRAFT' },
          featured: { type: 'boolean', example: true },
          categoryId: { type: 'string', format: 'uuid' },
          tags: { type: 'string', example: 'packaging,eco-friendly,b2b' },
          seoTitle: { type: 'string', example: 'Eco-Friendly Food Packaging Guide' },
          seoDescription: { type: 'string', example: 'Learn how eco-friendly packaging helps food brands.' },
          seoKeywords: { type: 'string', example: 'eco packaging,paper cups,food packaging' },
          canonicalUrl: { type: 'string', example: 'https://example.com/blog/eco-packaging' },
          metaRobots: { type: 'string', example: 'index,follow' },
          thumbnail: { type: 'string', format: 'binary' }
        }
      },
      InquiryInput: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'John Buyer' },
          company: { type: 'string', example: 'Global Food Imports LLC' },
          email: { type: 'string', example: 'buyer@example.com' },
          phone: { type: 'string', example: '+971 555 123 456' },
          country: { type: 'string', example: 'United Arab Emirates' },
          product: { type: 'string', example: 'Paper Cups' },
          message: { type: 'string', example: 'Please quote 100,000 custom printed paper cups.' },
          sourcePage: { type: 'string', example: '/products/paper-cups' }
        }
      },
      MediaUploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          image: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              publicId: { type: 'string' },
              transformations: {
                type: 'object',
                properties: {
                  thumbnail: { type: 'string' },
                  card: { type: 'string' },
                  large: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/v1/products': {
      get: {
        tags: ['Products'],
        summary: 'List public products with search, filtering, and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'featured', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Paginated product list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 2,
                  totalProducts: 12,
                  products: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/products/featured': {
      get: {
        tags: ['Products'],
        summary: 'Get up to 6 featured products',
        responses: {
          200: {
            description: 'Featured products',
            content: {
              'application/json': {
                example: { success: true, products: [] }
              }
            }
          }
        }
      }
    },
    '/api/v1/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product detail' },
          404: { description: 'Product not found' }
        }
      }
    },
    '/api/v1/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List public active categories',
        responses: {
          200: {
            description: 'Category list',
            content: {
              'application/json': {
                example: { success: true, categories: [] }
              }
            }
          }
        }
      }
    },
    '/api/v1/blogs': {
      get: {
        tags: ['Blogs'],
        summary: 'List published blogs with search, tags, categories, featured filter, and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'featured', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Paginated blog list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 1,
                  totalBlogs: 3,
                  blogs: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/blogs/{slug}': {
      get: {
        tags: ['Blogs'],
        summary: 'Get published blog by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Blog detail' },
          404: { description: 'Blog not found' }
        }
      }
    },
    '/api/v1/admin/blogs': {
      get: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Admin blog list with status, featured, category, tag, search, and pagination'
      },
      post: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Create blog with SEO metadata, tags, category, content format, and thumbnail upload',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/BlogInput' }
            }
          }
        },
        responses: {
          201: { description: 'Blog created' },
          409: { description: 'Duplicate slug' }
        }
      }
    },
    '/api/v1/admin/blogs/{id}': {
      get: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Get admin blog detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      put: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Edit blog',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      delete: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Soft delete blog',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    },
    '/api/v1/admin/blogs/{id}/publish': {
      patch: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Publish blog',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    },
    '/api/v1/admin/blogs/{id}/draft': {
      patch: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Move blog to draft',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    },
    '/api/v1/admin/blogs/{id}/related': {
      put: {
        tags: ['Admin Blog CMS'],
        security: [{ bearerAuth: [] }],
        summary: 'Set related articles',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { relatedIds: ['00000000-0000-0000-0000-000000000000'] }
            }
          }
        }
      }
    },
    '/api/v1/inquiries/contact': {
      post: {
        tags: ['Inquiries'],
        summary: 'Submit contact form inquiry',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryInput' }
            }
          }
        },
        responses: {
          201: { description: 'Inquiry submitted' }
        }
      }
    },
    '/api/v1/inquiries/request-quote': {
      post: {
        tags: ['Inquiries'],
        summary: 'Submit request quote form',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryInput' }
            }
          }
        },
        responses: {
          201: { description: 'Quote request submitted' }
        }
      }
    },
    '/api/v1/inquiries/newsletter': {
      post: {
        tags: ['Inquiries'],
        summary: 'Subscribe to newsletter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { email: 'buyer@example.com', name: 'John Buyer' }
            }
          }
        },
        responses: {
          201: { description: 'Newsletter subscription received' }
        }
      }
    },
    '/api/v1/inquiries/brochure-download': {
      post: {
        tags: ['Inquiries'],
        summary: 'Track brochure download inquiry',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryInput' }
            }
          }
        },
        responses: {
          201: { description: 'Brochure download tracked' }
        }
      }
    },
    '/api/v1/inquiries/whatsapp': {
      post: {
        tags: ['Inquiries'],
        summary: 'Track WhatsApp CTA and return WhatsApp URL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { product: 'Paper Cups', phone: '+971 555 123 456', country: 'UAE' }
            }
          }
        },
        responses: {
          201: { description: 'WhatsApp CTA tracked' }
        }
      }
    },
    '/api/v1/inquiries': {
      get: {
        tags: ['Admin Inquiries'],
        security: [{ bearerAuth: [] }],
        summary: 'List inquiries with search, filters, and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NEW', 'OPEN', 'REPLIED', 'CLOSED'] } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'product', in: 'query', schema: { type: 'string' } },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Paginated inquiry list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 1,
                  totalInquiries: 5,
                  inquiries: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/inquiries/export.csv': {
      get: {
        tags: ['Admin Inquiries'],
        security: [{ bearerAuth: [] }],
        summary: 'Export inquiries as CSV',
        responses: {
          200: { description: 'CSV file' }
        }
      }
    },
    '/api/v1/inquiries/{id}/status': {
      patch: {
        tags: ['Admin Inquiries'],
        security: [{ bearerAuth: [] }],
        summary: 'Update inquiry status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { status: 'OPEN' }
            }
          }
        }
      }
    },
    '/api/v1/admin/products': {
      get: {
        tags: ['Admin Products'],
        security: [{ bearerAuth: [] }],
        summary: 'Admin product list with inactive/draft filtering'
      },
      post: {
        tags: ['Admin Products'],
        security: [{ bearerAuth: [] }],
        summary: 'Create product with up to 10 images',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/ProductInput' }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          400: { description: 'Invalid category or validation failure' },
          409: { description: 'Duplicate slug' }
        }
      }
    },
    '/api/v1/admin/products/{id}': {
      put: {
        tags: ['Admin Products'],
        security: [{ bearerAuth: [] }],
        summary: 'Update product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      delete: {
        tags: ['Admin Products'],
        security: [{ bearerAuth: [] }],
        summary: 'Soft delete product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Product soft deleted',
            content: {
              'application/json': {
                example: { success: true, message: 'Product deleted successfully.' }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/categories': {
      get: {
        tags: ['Admin Categories'],
        security: [{ bearerAuth: [] }],
        summary: 'Admin category list'
      },
      post: {
        tags: ['Admin Categories'],
        security: [{ bearerAuth: [] }],
        summary: 'Create category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryInput' }
            }
          }
        }
      }
    },
    '/api/v1/admin/categories/{id}': {
      put: {
        tags: ['Admin Categories'],
        security: [{ bearerAuth: [] }],
        summary: 'Update category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      delete: {
        tags: ['Admin Categories'],
        security: [{ bearerAuth: [] }],
        summary: 'Soft delete category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    },
    '/api/v1/admin/dashboard/summary': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get dashboard summary cards',
        responses: {
          200: {
            description: 'Dashboard count cards',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    products: 24,
                    blogs: 8,
                    inquiries: 42,
                    categories: 6
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/inquiries/monthly': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get monthly inquiry analytics',
        parameters: [{ name: 'year', in: 'query', schema: { type: 'integer', example: 2026 } }],
        responses: {
          200: {
            description: 'Monthly inquiry counts',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    year: 2026,
                    months: [
                      { month: 'Jan', count: 4 },
                      { month: 'Feb', count: 8 },
                      { month: 'Mar', count: 3 }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/inquiries/latest': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get latest inquiries for the dashboard',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NEW', 'OPEN', 'REPLIED', 'CLOSED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Latest inquiries',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 1,
                  totalInquiries: 2,
                  inquiries: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/blogs/recent': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get recent blogs for the dashboard',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 5 } }
        ],
        responses: {
          200: {
            description: 'Recent blogs',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 1,
                  totalBlogs: 5,
                  blogs: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/products/featured': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get featured products for the dashboard',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 6 } }
        ],
        responses: {
          200: {
            description: 'Featured products',
            content: {
              'application/json': {
                example: {
                  success: true,
                  currentPage: 1,
                  totalPages: 1,
                  totalProducts: 6,
                  products: []
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/search': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Search products, blogs, and inquiries',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', example: 'paper cups' } },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Global search results',
            content: {
              'application/json': {
                example: {
                  success: true,
                  query: 'paper cups',
                  totalResults: 12,
                  products: { total: 4, data: [] },
                  blogs: { total: 3, data: [] },
                  inquiries: { total: 5, data: [] }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/dashboard/visitors': {
      get: {
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        summary: 'Get visitors analytics',
        parameters: [{ name: 'year', in: 'query', schema: { type: 'integer', example: 2026 } }],
        responses: {
          200: {
            description: 'Visitor analytics summary',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    totalVisitors: 1200,
                    currentMonthVisitors: 140,
                    year: 2026,
                    monthly: [{ month: 'Jan', count: 80 }],
                    topPages: [{ path: '/products/paper-cups', count: 50 }],
                    topSources: [{ source: 'Direct', count: 30 }]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/admin/product/upload': {
      post: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload up to 10 product images',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['productId', 'images'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  images: {
                    type: 'array',
                    maxItems: 10,
                    items: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product images uploaded' },
          400: { description: 'Wrong format, missing product, or too many images' },
          502: { description: 'Cloudinary failure' }
        }
      }
    },
    '/api/v1/admin/blog/upload': {
      post: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload blog thumbnail or cover image',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['blogId', 'imageType', 'image'],
                properties: {
                  blogId: { type: 'string', format: 'uuid' },
                  imageType: { type: 'string', enum: ['thumbnail', 'cover'] },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Blog image uploaded' }
        }
      }
    },
    '/api/v1/admin/banners/upload': {
      post: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Upload multiple hero banners',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Homepage Banner' },
                  alt: { type: 'string', example: 'Eco packaging hero banner' },
                  images: {
                    type: 'array',
                    maxItems: 10,
                    items: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Hero banners uploaded' }
        }
      }
    },
    '/api/v1/admin/product-images/{id}': {
      put: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Replace a product image',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      delete: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete product image from Cloudinary and PostgreSQL',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    },
    '/api/v1/admin/assets/{id}': {
      put: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Replace generic media asset',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      },
      delete: {
        tags: ['Admin Media'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete generic media asset',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      }
    }
  }
};
