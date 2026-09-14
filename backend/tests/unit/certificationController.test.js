import { jest } from '@jest/globals';

const findMany = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: { certification: { findMany, create, update } }
}));

const {
  createCertification,
  deleteCertification,
  getCertifications,
  updateCertification
} = await import('../../src/controllers/certificationController.js');

function response() {
  return { set: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

function run(handler, req, res) {
  return new Promise((resolve, reject) => {
    handler(req, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('certification controllers', () => {
  beforeEach(() => {
    findMany.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('returns only active non-deleted public certifications', async () => {
    const certifications = [{ id: 'one', title: 'Verified certificate' }];
    const res = response();
    findMany.mockResolvedValue(certifications);
    await run(getCertifications, { query: {} }, res);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isDeleted: false, status: 'ACTIVE' },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
    }));
    expect(res.json).toHaveBeenCalledWith({ success: true, certifications });
  });

  it('normalizes optional fields and dates when creating', async () => {
    const certification = { id: 'one', title: 'Verified certificate' };
    const res = response();
    create.mockResolvedValue(certification);
    await run(createCertification, {
      body: {
        title: certification.title,
        description: 'Verified company document.',
        issuer: '',
        issueDate: '2026-01-02',
        id: 'ignored'
      }
    }, res);
    expect(create).toHaveBeenCalledWith({ data: {
      title: certification.title,
      description: 'Verified company document.',
      issuer: null,
      issueDate: new Date('2026-01-02')
    } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updates only editable certification fields', async () => {
    const certification = { id: 'one', title: 'Verified certificate', status: 'ACTIVE' };
    const res = response();
    update.mockResolvedValue(certification);
    await run(updateCertification, {
      params: { id: 'one' },
      body: { status: 'ACTIVE', createdAt: 'ignored' }
    }, res);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'one', isDeleted: false },
      data: { status: 'ACTIVE' }
    });
  });

  it('soft deletes a certification', async () => {
    const res = response();
    update.mockResolvedValue({ id: 'one' });
    await run(deleteCertification, { params: { id: 'one' } }, res);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'one', isDeleted: false },
      data: { isDeleted: true, deletedAt: expect.any(Date), status: 'INACTIVE' }
    });
  });
});
