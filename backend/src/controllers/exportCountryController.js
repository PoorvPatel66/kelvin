import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const editableFields = ['countryName', 'flagUrl', 'flagPublicId', 'status'];

function exportCountryData(body) {
  return editableFields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});
}

function translatePrismaError(error) {
  if (error.code === 'P2002') return new AppError('An export market with this country name already exists.', 409);
  if (error.code === 'P2025') return new AppError('Export market not found.', 404);
  return error;
}

export const getExportCountries = asyncHandler(async (req, res) => {
  const countries = await prisma.exportCountry.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { countryName: 'asc' }
  });

  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=900');
  res.status(200).json({ success: true, countries });
});

export const getAdminExportCountries = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.q) {
    where.countryName = { contains: req.query.q, mode: 'insensitive' };
  }

  const countries = await prisma.exportCountry.findMany({
    where,
    orderBy: { countryName: 'asc' }
  });

  res.status(200).json({ success: true, countries });
});

export const createExportCountry = asyncHandler(async (req, res) => {
  try {
    const country = await prisma.exportCountry.create({ data: exportCountryData(req.body) });
    res.status(201).json({ success: true, message: 'Export market created.', country });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const updateExportCountry = asyncHandler(async (req, res) => {
  try {
    const country = await prisma.exportCountry.update({
      where: { id: req.params.id },
      data: exportCountryData(req.body)
    });
    res.status(200).json({ success: true, message: 'Export market updated.', country });
  } catch (error) {
    throw translatePrismaError(error);
  }
});

export const deleteExportCountry = asyncHandler(async (req, res) => {
  try {
    await prisma.exportCountry.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Export market deleted.' });
  } catch (error) {
    throw translatePrismaError(error);
  }
});
