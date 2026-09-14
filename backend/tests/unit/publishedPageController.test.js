import { jest } from '@jest/globals';

const findFirst = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: {
    websitePage: {
      findFirst
    }
  }
}));

const { getPublishedPage } = await import('../../src/controllers/pageController.js');

function createResponse() {
  return {
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

function runController(req, res) {
  return new Promise((resolve, reject) => {
    const next = (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    getPublishedPage(req, res, next);
    setImmediate(resolve);
  });
}

describe('getPublishedPage', () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it('returns a published page by page key or slug', async () => {
    const page = {
      title: 'Products',
      slug: 'products',
      pageKey: 'products',
      sections: { hero: { heading: 'Product catalogue' } }
    };
    const req = { params: { identifier: ' Products ' } };
    const res = createResponse();
    findFirst.mockResolvedValue(page);

    await runController(req, res);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PUBLISHED',
          OR: [{ pageKey: 'products' }, { slug: 'products' }]
        }
      })
    );
    expect(res.set).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, page });
  });

  it('rejects identifiers without a published page', async () => {
    const req = { params: { identifier: 'draft-page' } };
    const res = createResponse();
    findFirst.mockResolvedValue(null);

    await expect(runController(req, res)).rejects.toMatchObject({
      message: 'Published website page not found.',
      statusCode: 404
    });
    expect(res.json).not.toHaveBeenCalled();
  });
});
