import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { customersToCsv } from '../utils/csv.js';

const editableFields = ['name', 'company', 'email', 'phone', 'country', 'status', 'source'];

function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function buildCustomerWhere(query) {
  const where = { isDeleted: false };

  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.country) where.country = { contains: query.country, mode: 'insensitive' };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { company: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { country: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  return where;
}

function customerData(body) {
  const data = editableFields.reduce((result, field) => {
    if (body[field] !== undefined) result[field] = body[field] || null;
    return result;
  }, {});

  if (data.email) data.email = data.email.trim().toLowerCase();
  return data;
}

function translatePrismaError(error) {
  if (error.code === 'P2002') return new AppError('A customer with this email already exists.', 409);
  if (error.code === 'P2025') return new AppError('Customer not found.', 404);
  return error;
}

const customerProfileInclude = {
  notes: {
    orderBy: { createdAt: 'desc' },
    include: { admin: { select: { id: true, name: true } } }
  },
  inquiries: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      product: true,
      message: true,
      status: true,
      sourcePage: true,
      createdAt: true
    }
  },
  _count: { select: { inquiries: true, notes: true } }
};

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildCustomerWhere(req.query);

  const [customers, totalCustomers] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { inquiries: true, notes: true } } }
    }),
    prisma.customer.count({ where })
  ]);

  res.status(200).json({
    success: true,
    customers,
    currentPage: page,
    totalPages: Math.ceil(totalCustomers / limit) || 1,
    totalCustomers
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, isDeleted: false },
    include: customerProfileInclude
  });

  if (!customer) throw new AppError('Customer not found.', 404);
  res.status(200).json({ success: true, customer });
});

export const createCustomer = asyncHandler(async (req, res) => {
  try {
    const customer = await prisma.customer.create({ data: customerData(req.body) });
    res.status(201).json({ success: true, message: 'Customer created.', customer });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const updateCustomer = asyncHandler(async (req, res) => {
  try {
    const existingCustomer = await prisma.customer.findFirst({
      where: { id: req.params.id, isDeleted: false },
      select: { id: true }
    });

    if (!existingCustomer) throw new AppError('Customer not found.', 404);

    const customer = await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: customerData(req.body)
    });
    res.status(200).json({ success: true, message: 'Customer updated.', customer });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  try {
    const existingCustomer = await prisma.customer.findFirst({
      where: { id: req.params.id, isDeleted: false },
      select: { id: true }
    });

    if (!existingCustomer) throw new AppError('Customer not found.', 404);

    await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }
    });
    res.status(200).json({ success: true, message: 'Customer archived.' });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const addCustomerNote = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, isDeleted: false },
    select: { id: true }
  });

  if (!customer) throw new AppError('Customer not found.', 404);

  const note = await prisma.customerNote.create({
    data: {
      customerId: customer.id,
      adminId: req.user.id,
      message: req.body.message
    },
    include: { admin: { select: { id: true, name: true } } }
  });

  res.status(201).json({ success: true, message: 'Customer note added.', note });
});

export const exportCustomersCsv = asyncHandler(async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: buildCustomerWhere(req.query),
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { inquiries: true } } }
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="kelvin-customers.csv"');
  res.status(200).send(customersToCsv(customers));
});
