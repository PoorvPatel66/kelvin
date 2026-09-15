import { CustomerSource, InquiryStatus, InquiryType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendInquiryNotification } from '../services/notificationService.js';
import { inquiriesToCsv } from '../utils/csv.js';
import { createAdminNotification } from '../services/adminNotificationService.js';

function getPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildInquiryWhere(query) {
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.product) {
    where.product = { contains: query.product, mode: 'insensitive' };
  }

  if (query.country) {
    where.country = { contains: query.country, mode: 'insensitive' };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { company: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { product: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from && { gte: new Date(query.from) }),
      ...(query.to && { lte: new Date(query.to) })
    };
  }

  return where;
}

async function createTypedInquiry(req, type, overrides = {}) {
  const email = req.body.email.trim().toLowerCase();
  const name = req.body.name || 'Newsletter Subscriber';
  const source = CustomerSource[type] || CustomerSource.CONTACT;

  const inquiry = await prisma.$transaction(async (transaction) => {
    const customer = await transaction.customer.upsert({
      where: { email },
      update: {
        name,
        ...(req.body.company && { company: req.body.company }),
        ...(req.body.phone && { phone: req.body.phone }),
        ...(req.body.country && { country: req.body.country }),
        isDeleted: false,
        deletedAt: null
      },
      create: {
        name,
        company: req.body.company,
        email,
        phone: req.body.phone,
        country: req.body.country,
        source
      }
    });

    return transaction.inquiry.create({
      data: {
        type,
        name,
        company: req.body.company,
        email,
        phone: req.body.phone,
        country: req.body.country,
        product: req.body.product,
        message: req.body.message,
        sourcePage: req.body.sourcePage,
        brochureUrl: req.body.brochureUrl,
        whatsappUrl: req.body.whatsappUrl,
        customerId: customer.id,
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          ...overrides.metadata
        }
      }
    });
  });

  sendInquiryNotification(inquiry);
  void createAdminNotification({
    type: type === InquiryType.REQUEST_QUOTE ? 'QUOTE' : 'LEAD',
    title: type === InquiryType.REQUEST_QUOTE ? 'New quote request' : 'New website inquiry',
    message: `${name} submitted ${type.replaceAll('_', ' ').toLowerCase()}.`,
    entityType: 'inquiry',
    entityId: inquiry.id,
    actionUrl: type === InquiryType.REQUEST_QUOTE ? '/admin/quotes' : '/admin/leads'
  });

  return inquiry;
}

export const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createTypedInquiry(req, req.body.type || InquiryType.CONTACT);

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully.',
    inquiry
  });
});

export const createContactInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createTypedInquiry(req, InquiryType.CONTACT);

  res.status(201).json({
    success: true,
    message: 'Contact inquiry submitted successfully.',
    inquiry
  });
});

export const createQuoteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createTypedInquiry(req, InquiryType.REQUEST_QUOTE);

  res.status(201).json({
    success: true,
    message: 'Quote request submitted successfully.',
    inquiry
  });
});

export const createNewsletterInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createTypedInquiry(req, InquiryType.NEWSLETTER);

  res.status(201).json({
    success: true,
    message: 'Newsletter subscription received.',
    inquiry
  });
});

export const createBrochureDownloadInquiry = asyncHandler(async (req, res) => {
  const inquiry = await createTypedInquiry(req, InquiryType.BROCHURE_DOWNLOAD);

  res.status(201).json({
    success: true,
    message: 'Brochure download request received.',
    brochureUrl: inquiry.brochureUrl,
    inquiry
  });
});

export const createWhatsAppInquiry = asyncHandler(async (req, res) => {
  const phone = process.env.WHATSAPP_NUMBER || '919999999999';
  const text = encodeURIComponent(
    `Hello Kelvin Eco Products, I am interested in ${req.body.product || 'your packaging products'}.`
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${text}`;

  const inquiry = await createTypedInquiry(req, InquiryType.WHATSAPP, {
    metadata: { generatedWhatsappUrl: whatsappUrl }
  });

  res.status(201).json({
    success: true,
    message: 'WhatsApp CTA tracked successfully.',
    whatsappUrl,
    inquiry
  });
});

export const getInquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildInquiryWhere(req.query);

  const [inquiries, totalInquiries] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: {
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.inquiry.count({ where })
  ]);

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalInquiries / limit) || 1,
    totalInquiries,
    inquiries
  });
});

export const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: req.params.id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!inquiry) {
    throw new AppError('Inquiry not found.', 404);
  }

  res.status(200).json({
    success: true,
    inquiry
  });
});

export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const status = req.body.status;

  const inquiry = await prisma.inquiry.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(status === InquiryStatus.REPLIED && { repliedAt: new Date() }),
      ...(status === InquiryStatus.CLOSED && { closedAt: new Date() })
    }
  });

  res.status(200).json({
    success: true,
    inquiry
  });
});

export const deleteInquiry = asyncHandler(async (req, res) => {
  try {
    await prisma.inquiry.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted.'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Inquiry not found.', 404);
    }

    throw error;
  }
});

export const addInquiryNote = asyncHandler(async (req, res) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: req.params.id }
  });

  if (!inquiry) {
    throw new AppError('Inquiry not found.', 404);
  }

  const note = await prisma.inquiryNote.create({
    data: {
      inquiryId: req.params.id,
      adminId: req.user.id,
      message: req.body.message
    }
  });

  res.status(201).json({
    success: true,
    note
  });
});

export const resendInquiryNotification = asyncHandler(async (req, res) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: req.params.id }
  });

  if (!inquiry) {
    throw new AppError('Inquiry not found.', 404);
  }

  const sent = await sendInquiryNotification(inquiry);

  res.status(200).json({
    success: true,
    sent,
    message: sent ? 'Notification resent successfully.' : 'Notification could not be sent.'
  });
});

export const exportInquiriesCsv = asyncHandler(async (req, res) => {
  const inquiries = await prisma.inquiry.findMany({
    where: buildInquiryWhere(req.query),
    orderBy: { createdAt: 'desc' }
  });

  const csv = inquiriesToCsv(inquiries);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="kelvin-inquiries.csv"');
  res.status(200).send(csv);
});

export const getInquiryDashboard = asyncHandler(async (req, res) => {
  const [total, newest, open, replied, closed, byType] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
    prisma.inquiry.count({ where: { status: InquiryStatus.OPEN } }),
    prisma.inquiry.count({ where: { status: InquiryStatus.REPLIED } }),
    prisma.inquiry.count({ where: { status: InquiryStatus.CLOSED } }),
    prisma.inquiry.groupBy({
      by: ['type'],
      _count: { type: true }
    })
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total,
      newest,
      open,
      replied,
      closed,
      byType
    }
  });
});
