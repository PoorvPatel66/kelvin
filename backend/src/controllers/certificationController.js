import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const editableFields = [
  'title',
  'issuer',
  'certificateNumber',
  'description',
  'issueDate',
  'expiryDate',
  'icon',
  'pdfUrl',
  'status',
  'sortOrder'
];

const nullableTextFields = new Set([
  'issuer',
  'certificateNumber',
  'icon',
  'pdfUrl'
]);

const dateFields = new Set(['issueDate', 'expiryDate']);

function certificationData(body) {
  return editableFields.reduce((data, field) => {
    if (body[field] === undefined) return data;

    if (dateFields.has(field)) {
      data[field] = body[field] ? new Date(body[field]) : null;
    } else if (nullableTextFields.has(field)) {
      data[field] = body[field] || null;
    } else {
      data[field] = body[field];
    }

    return data;
  }, {});
}

function translatePrismaError(error) {
  if (error.code === 'P2002') return new AppError('A certification with this title already exists.', 409);
  if (error.code === 'P2025') return new AppError('Certification not found.', 404);
  return error;
}

export const getCertifications = asyncHandler(async (req, res) => {
  const certifications = await prisma.certification.findMany({
    where: { isDeleted: false, status: 'ACTIVE' },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      title: true,
      issuer: true,
      certificateNumber: true,
      description: true,
      issueDate: true,
      expiryDate: true,
      icon: true,
      pdfUrl: true,
      sortOrder: true,
      updatedAt: true
    }
  });

  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=900');
  res.status(200).json({ success: true, certifications });
});

export const getAdminCertifications = asyncHandler(async (req, res) => {
  const where = { isDeleted: false };
  if (req.query.status) where.status = req.query.status;
  if (req.query.q) {
    where.OR = [
      { title: { contains: req.query.q, mode: 'insensitive' } },
      { issuer: { contains: req.query.q, mode: 'insensitive' } },
      { certificateNumber: { contains: req.query.q, mode: 'insensitive' } },
      { description: { contains: req.query.q, mode: 'insensitive' } }
    ];
  }

  const certifications = await prisma.certification.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
  });

  res.status(200).json({ success: true, certifications });
});

export const createCertification = asyncHandler(async (req, res) => {
  try {
    const certification = await prisma.certification.create({
      data: certificationData(req.body)
    });
    res.status(201).json({ success: true, message: 'Certification created.', certification });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const updateCertification = asyncHandler(async (req, res) => {
  try {
    const certification = await prisma.certification.update({
      where: { id: req.params.id, isDeleted: false },
      data: certificationData(req.body)
    });
    res.status(200).json({ success: true, message: 'Certification updated.', certification });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const deleteCertification = asyncHandler(async (req, res) => {
  try {
    await prisma.certification.update({
      where: { id: req.params.id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }
    });
    res.status(200).json({ success: true, message: 'Certification deleted.' });
  } catch (error) {
    throw translatePrismaError(error);
  }
});
