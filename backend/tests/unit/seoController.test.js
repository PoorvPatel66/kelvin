import { jest } from '@jest/globals';

const websitePage = { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() };
const product = { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() };
const blog = { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() };

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: { websitePage, product, blog }
}));

const { getSeoRecords, getSeoSummary, updateSeoRecord } = await import('../../src/controllers/seoController.js');

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

function run(handler, req, res) {
  return new Promise((resolve, reject) => {
    handler(req, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('SEO controllers', () => {
  beforeEach(() => {
    Object.values(websitePage).forEach((mock) => mock.mockReset());
    Object.values(product).forEach((mock) => mock.mockReset());
    Object.values(blog).forEach((mock) => mock.mockReset());
  });

  it('summarizes real page, product, and blog SEO coverage', async () => {
    websitePage.findMany.mockResolvedValue([
      { seoTitle: 'Home SEO', seoDescription: 'Home description' },
      { seoTitle: null, seoDescription: null }
    ]);
    product.findMany.mockResolvedValue([{ seoTitle: 'Cup SEO', seoDescription: 'Cup description' }]);
    blog.findMany.mockResolvedValue([{ seoTitle: null, seoDescription: 'Only a description' }]);
    const res = response();

    await run(getSeoSummary, { query: {} }, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      summary: [
        { type: 'PAGE', total: 2, optimized: 1, missing: 1 },
        { type: 'PRODUCT', total: 1, optimized: 1, missing: 0 },
        { type: 'BLOG', total: 1, optimized: 0, missing: 1 }
      ],
      totals: { total: 4, optimized: 2, missing: 2 }
    });
  });

  it('lists paginated non-deleted product SEO records', async () => {
    const record = {
      id: '45e0cbac-6a51-4dda-a867-10912f5f6f13',
      name: 'Paper Cup',
      slug: 'paper-cup',
      status: 'ACTIVE',
      seoTitle: 'Paper Cup Supplier',
      seoDescription: 'Food-grade paper cups for B2B buyers.',
      seoKeywords: ['paper cups'],
      canonicalUrl: null,
      metaRobots: null,
      ogImage: null,
      updatedAt: new Date('2026-08-13')
    };
    product.findMany.mockResolvedValue([record]);
    product.count.mockResolvedValue(1);
    const res = response();

    await run(getSeoRecords, { query: { type: 'PRODUCT', page: '1', limit: '10' } }, res);

    expect(product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isDeleted: false },
      skip: 0,
      take: 10
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      type: 'PRODUCT',
      totalRecords: 1,
      records: [expect.objectContaining({ title: 'Paper Cup', optimized: true })]
    }));
  });

  it('updates page SEO fields and normalizes keywords', async () => {
    const id = '45e0cbac-6a51-4dda-a867-10912f5f6f13';
    websitePage.findUnique.mockResolvedValue({ id });
    websitePage.update.mockResolvedValue({
      id,
      title: 'About',
      slug: 'about-us',
      pageKey: 'about',
      status: 'PUBLISHED',
      seoTitle: 'About Kelvin Eco Products',
      seoDescription: 'Learn about Kelvin Eco Products.',
      seoKeywords: ['eco packaging', 'manufacturer'],
      canonicalUrl: null,
      metaRobots: 'index,follow',
      ogImage: null,
      updatedAt: new Date('2026-08-13')
    });
    const res = response();

    await run(updateSeoRecord, {
      params: { type: 'PAGE', id },
      body: {
        slug: 'about-us',
        seoTitle: 'About Kelvin Eco Products',
        seoDescription: 'Learn about Kelvin Eco Products.',
        seoKeywords: ['eco packaging', 'manufacturer', 'eco packaging'],
        metaRobots: 'index,follow'
      }
    }, res);

    expect(websitePage.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id },
      data: expect.objectContaining({
        slug: 'about-us',
        seoKeywords: ['eco packaging', 'manufacturer']
      })
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      record: expect.objectContaining({ title: 'About', optimized: true })
    }));
  });
});
