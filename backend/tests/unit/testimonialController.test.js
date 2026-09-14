import { jest } from '@jest/globals';

const findMany = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: { testimonial: { findMany, create, update } }
}));

const { createTestimonial, deleteTestimonial, getTestimonials } = await import('../../src/controllers/testimonialController.js');

function response() {
  return { set: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

function run(handler, req, res) {
  return new Promise((resolve, reject) => {
    handler(req, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('testimonial controllers', () => {
  beforeEach(() => { findMany.mockReset(); create.mockReset(); update.mockReset(); });

  it('returns active public testimonials in display order', async () => {
    const testimonials = [{ id: 'one', name: 'Client', sortOrder: 10 }];
    const res = response();
    findMany.mockResolvedValue(testimonials);
    await run(getTestimonials, { query: { featured: 'true' } }, res);
    expect(findMany).toHaveBeenCalledWith({
      where: { isDeleted: false, status: 'ACTIVE', featured: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, testimonials });
  });

  it('creates a testimonial using only editable fields', async () => {
    const testimonial = { id: 'one', name: 'Client', quote: 'A verified client review.' };
    const res = response();
    create.mockResolvedValue(testimonial);
    await run(createTestimonial, { body: { ...testimonial, id: 'ignored', isDeleted: true, status: 'ACTIVE' } }, res);
    expect(create).toHaveBeenCalledWith({ data: { name: 'Client', quote: 'A verified client review.', status: 'ACTIVE' } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('soft deletes testimonials instead of removing records', async () => {
    const res = response();
    update.mockResolvedValue({ id: 'one' });
    await run(deleteTestimonial, { params: { id: 'one' } }, res);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'one' },
      data: { isDeleted: true, deletedAt: expect.any(Date), status: 'INACTIVE' }
    });
  });
});
