import { jest } from '@jest/globals';

const findMany = jest.fn();
const count = jest.fn();
const findFirst = jest.fn();
const create = jest.fn();
const update = jest.fn();
const noteCreate = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: {
    customer: { findMany, count, findFirst, create, update },
    customerNote: { create: noteCreate }
  }
}));

const {
  addCustomerNote,
  createCustomer,
  deleteCustomer,
  exportCustomersCsv,
  getCustomers
} = await import('../../src/controllers/customerController.js');

function response() {
  return {
    setHeader: jest.fn(),
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

function run(handler, req, res) {
  return new Promise((resolve, reject) => {
    handler(req, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('customer controllers', () => {
  beforeEach(() => {
    findMany.mockReset();
    count.mockReset();
    findFirst.mockReset();
    create.mockReset();
    update.mockReset();
    noteCreate.mockReset();
  });

  it('lists non-deleted customers with filters and pagination', async () => {
    const customers = [{ id: 'customer-1', name: 'Buyer' }];
    const res = response();
    findMany.mockResolvedValue(customers);
    count.mockResolvedValue(11);

    await run(getCustomers, {
      query: { page: '2', limit: '5', search: 'buyer', status: 'ACTIVE' }
    }, res);

    const where = {
      isDeleted: false,
      status: 'ACTIVE',
      OR: expect.arrayContaining([
        { name: { contains: 'buyer', mode: 'insensitive' } },
        { email: { contains: 'buyer', mode: 'insensitive' } }
      ])
    };
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where, skip: 5, take: 5 }));
    expect(count).toHaveBeenCalledWith({ where });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      customers,
      currentPage: 2,
      totalPages: 3,
      totalCustomers: 11
    });
  });

  it('normalizes customer email and ignores non-editable fields', async () => {
    const customer = { id: 'customer-1', name: 'Buyer', email: 'buyer@example.com' };
    const res = response();
    create.mockResolvedValue(customer);

    await run(createCustomer, {
      body: {
        id: 'ignored',
        name: 'Buyer',
        email: ' Buyer@Example.com ',
        source: 'MANUAL',
        isDeleted: true
      }
    }, res);

    expect(create).toHaveBeenCalledWith({
      data: { name: 'Buyer', email: 'buyer@example.com', source: 'MANUAL' }
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('archives a customer while retaining their history', async () => {
    const res = response();
    findFirst.mockResolvedValue({ id: 'customer-1' });
    update.mockResolvedValue({ id: 'customer-1' });

    await run(deleteCustomer, { params: { id: 'customer-1' } }, res);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { isDeleted: true, deletedAt: expect.any(Date), status: 'INACTIVE' }
    });
  });

  it('records private notes against the current admin', async () => {
    const note = { id: 'note-1', message: 'Call the buyer tomorrow.' };
    const res = response();
    findFirst.mockResolvedValue({ id: 'customer-1' });
    noteCreate.mockResolvedValue(note);

    await run(addCustomerNote, {
      params: { id: 'customer-1' },
      user: { id: 'admin-1' },
      body: { message: 'Call the buyer tomorrow.' }
    }, res);

    expect(noteCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        customerId: 'customer-1',
        adminId: 'admin-1',
        message: 'Call the buyer tomorrow.'
      }
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('exports spreadsheet-safe customer CSV data', async () => {
    const res = response();
    findMany.mockResolvedValue([{
      id: 'customer-1',
      name: '=HYPERLINK("https://example.com")',
      email: 'buyer@example.com',
      _count: { inquiries: 2 }
    }]);

    await run(exportCustomersCsv, { query: {} }, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining("'=HYPERLINK"));
  });
});
