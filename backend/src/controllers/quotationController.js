import PDFDocument from 'pdfkit';
import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAdminNotification } from '../services/adminNotificationService.js';

const quotationInclude = {
  customer: true,
  inquiry: { select: { id: true, type: true, product: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  items: {
    orderBy: { sortOrder: 'asc' },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      variant: { select: { id: true, name: true, sku: true } }
    }
  }
};

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function buildTotals(body) {
  const items = (body.items || []).map((item, index) => {
    const quantity = Math.max(money(item.quantity), 0);
    const unitPrice = Math.max(money(item.unitPrice), 0);
    return {
      productId: item.productId || null,
      variantId: item.variantId || null,
      name: item.name,
      description: item.description || null,
      quantity,
      unitPrice,
      lineTotal: money(quantity * unitPrice),
      sortOrder: index
    };
  });
  const subtotal = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const taxRate = Math.max(money(body.taxRate), 0);
  const discountAmount = Math.max(money(body.discountAmount), 0);
  const taxAmount = money((subtotal * taxRate) / 100);
  const totalAmount = Math.max(money(subtotal + taxAmount - discountAmount), 0);
  return { items, subtotal, taxRate, taxAmount, discountAmount, totalAmount };
}

function quotationNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `KEP-Q-${stamp}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 15, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export const getQuotations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.customerId) where.customerId = req.query.customerId;
  if (req.query.search) where.OR = [
    { quotationNumber: { contains: req.query.search, mode: 'insensitive' } },
    { customer: { is: { name: { contains: req.query.search, mode: 'insensitive' } } } },
    { customer: { is: { company: { contains: req.query.search, mode: 'insensitive' } } } }
  ];

  const [quotations, totalQuotations] = await Promise.all([
    prisma.quotation.findMany({ where, include: quotationInclude, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.quotation.count({ where })
  ]);
  res.json({ success: true, quotations, currentPage: page, totalPages: Math.ceil(totalQuotations / limit) || 1, totalQuotations });
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id }, include: quotationInclude });
  if (!quotation) throw new AppError('Quotation not found.', 404);
  res.json({ success: true, quotation });
});

export const createQuotation = asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({ where: { id: req.body.customerId, isDeleted: false }, select: { id: true } });
  if (!customer) throw new AppError('Valid customer is required.', 400);
  const totals = buildTotals(req.body);
  if (!totals.items.length) throw new AppError('At least one quotation item is required.', 400);

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: quotationNumber(),
      customerId: customer.id,
      inquiryId: req.body.inquiryId || null,
      createdById: req.user.id,
      status: req.body.status || 'DRAFT',
      currency: req.body.currency || 'INR',
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
      validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
      notes: req.body.notes || null,
      terms: req.body.terms || null,
      sentAt: req.body.status === 'SENT' ? new Date() : null,
      items: { create: totals.items }
    },
    include: quotationInclude
  });

  await createAdminNotification({
    type: 'QUOTE',
    title: 'Quotation created',
    message: `${quotation.quotationNumber} was created for ${quotation.customer.name}.`,
    entityType: 'quotation',
    entityId: quotation.id,
    actionUrl: '/admin/quotations'
  });
  res.status(201).json({ success: true, message: 'Quotation created.', quotation });
});

export const updateQuotation = asyncHandler(async (req, res) => {
  const existing = await prisma.quotation.findUnique({ where: { id: req.params.id }, select: { id: true, status: true } });
  if (!existing) throw new AppError('Quotation not found.', 404);
  if (['ACCEPTED', 'CANCELLED'].includes(existing.status)) throw new AppError('Accepted or cancelled quotations cannot be edited.', 409);

  const totals = buildTotals(req.body);
  if (!totals.items.length) throw new AppError('At least one quotation item is required.', 400);
  const status = req.body.status || existing.status;

  const quotation = await prisma.$transaction(async (transaction) => {
    await transaction.quotationItem.deleteMany({ where: { quotationId: existing.id } });
    return transaction.quotation.update({
      where: { id: existing.id },
      data: {
        customerId: req.body.customerId,
        inquiryId: req.body.inquiryId || null,
        status,
        currency: req.body.currency || 'INR',
        subtotal: totals.subtotal,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        notes: req.body.notes || null,
        terms: req.body.terms || null,
        sentAt: status === 'SENT' ? new Date() : undefined,
        acceptedAt: status === 'ACCEPTED' ? new Date() : undefined,
        items: { create: totals.items }
      },
      include: quotationInclude
    });
  });
  res.json({ success: true, message: 'Quotation updated.', quotation });
});

export const updateQuotationStatus = asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status,
      sentAt: req.body.status === 'SENT' ? new Date() : undefined,
      acceptedAt: req.body.status === 'ACCEPTED' ? new Date() : undefined
    },
    include: quotationInclude
  }).catch((error) => {
    if (error.code === 'P2025') throw new AppError('Quotation not found.', 404);
    throw error;
  });
  res.json({ success: true, message: 'Quotation status updated.', quotation });
});

export const deleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id }, select: { id: true, status: true } });
  if (!quotation) throw new AppError('Quotation not found.', 404);
  if (quotation.status !== 'DRAFT') throw new AppError('Only draft quotations can be deleted.', 409);
  await prisma.quotation.delete({ where: { id: quotation.id } });
  res.json({ success: true, message: 'Draft quotation deleted.' });
});

export const downloadQuotationPdf = asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id }, include: quotationInclude });
  if (!quotation) throw new AppError('Quotation not found.', 404);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${quotation.quotationNumber}.pdf"`);
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  doc.pipe(res);
  doc.fontSize(22).fillColor('#0F2D52').text('Kelvin Eco Products');
  doc.fontSize(10).fillColor('#2E7D32').text('THINK GREEN. PACK SMART.');
  doc.moveDown(1.5).fontSize(18).fillColor('#111827').text(`Quotation ${quotation.quotationNumber}`);
  doc.fontSize(10).fillColor('#475569').text(`Date: ${new Date(quotation.createdAt).toLocaleDateString('en-IN')}`);
  doc.text(`Valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : '-'}`);
  doc.moveDown().fontSize(12).fillColor('#111827').text(`Customer: ${quotation.customer.name}`);
  doc.fontSize(10).fillColor('#475569').text(quotation.customer.company || '');
  doc.text(quotation.customer.email);
  doc.moveDown();

  quotation.items.forEach((item, index) => {
    doc.fontSize(10).fillColor('#111827').text(`${index + 1}. ${item.name}`);
    doc.fillColor('#475569').text(`${Number(item.quantity)} x ${quotation.currency} ${Number(item.unitPrice).toFixed(2)} = ${quotation.currency} ${Number(item.lineTotal).toFixed(2)}`);
    if (item.description) doc.text(item.description);
    doc.moveDown(0.5);
  });

  doc.moveDown().fontSize(11).fillColor('#111827');
  doc.text(`Subtotal: ${quotation.currency} ${Number(quotation.subtotal).toFixed(2)}`, { align: 'right' });
  doc.text(`Tax (${Number(quotation.taxRate)}%): ${quotation.currency} ${Number(quotation.taxAmount).toFixed(2)}`, { align: 'right' });
  doc.text(`Discount: ${quotation.currency} ${Number(quotation.discountAmount).toFixed(2)}`, { align: 'right' });
  doc.fontSize(14).fillColor('#2E7D32').text(`Total: ${quotation.currency} ${Number(quotation.totalAmount).toFixed(2)}`, { align: 'right' });
  if (quotation.notes) doc.moveDown().fontSize(10).fillColor('#475569').text(`Notes: ${quotation.notes}`);
  if (quotation.terms) doc.moveDown().text(`Terms: ${quotation.terms}`);
  doc.end();
});
