import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const backupInclude = {
  createdBy: { select: { id: true, name: true, email: true } }
};

async function buildSnapshot() {
  const [
    categories,
    products,
    blogs,
    inquiries,
    customers,
    pages,
    navigationItems,
    siteSettings,
    seoMetadata,
    testimonials,
    certifications,
    exportCountries,
    catalogs,
    quotations
  ] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({ include: { images: true, variants: true } }),
    prisma.blog.findMany({ include: { category: true } }),
    prisma.inquiry.findMany({ include: { notes: true } }),
    prisma.customer.findMany({ include: { notes: true } }),
    prisma.websitePage.findMany(),
    prisma.navigationItem.findMany(),
    prisma.siteSetting.findMany(),
    prisma.seoMetadata.findMany(),
    prisma.testimonial.findMany(),
    prisma.certification.findMany(),
    prisma.exportCountry.findMany(),
    prisma.catalog.findMany(),
    prisma.quotation.findMany({ include: { items: true } })
  ]);

  const data = JSON.parse(JSON.stringify({
    categories,
    products,
    blogs,
    inquiries,
    customers,
    pages,
    navigationItems,
    siteSettings,
    seoMetadata,
    testimonials,
    certifications,
    exportCountries,
    catalogs,
    quotations
  }));
  const tableCounts = Object.fromEntries(Object.entries(data).map(([key, rows]) => [key, rows.length]));
  return { data, tableCounts };
}

export const getBackups = asyncHandler(async (req, res) => {
  const backups = await prisma.backup.findMany({
    include: backupInclude,
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ success: true, backups });
});

export const createBackup = asyncHandler(async (req, res) => {
  const backup = await prisma.backup.create({
    data: { label: req.body.label?.trim() || `Admin snapshot ${new Date().toISOString()}`, createdById: req.user.id },
    include: backupInclude
  });

  try {
    const { data, tableCounts } = await buildSnapshot();
    const completed = await prisma.backup.update({
      where: { id: backup.id },
      data: { status: 'COMPLETE', snapshot: data, tableCounts, completedAt: new Date() },
      include: backupInclude
    });
    res.status(201).json({ success: true, message: 'Backup snapshot created.', backup: completed });
  } catch (error) {
    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: 'FAILED', error: error.message, completedAt: new Date() }
    });
    throw error;
  }
});

export const downloadBackup = asyncHandler(async (req, res) => {
  const backup = await prisma.backup.findUnique({ where: { id: req.params.id }, include: backupInclude });
  if (!backup || backup.status !== 'COMPLETE' || !backup.snapshot) {
    throw new AppError('Completed backup not found.', 404);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="kelvin-backup-${backup.id}.json"`);
  res.send(JSON.stringify({ exportedAt: new Date().toISOString(), backup }, null, 2));
});

export const deleteBackup = asyncHandler(async (req, res) => {
  await prisma.backup.delete({ where: { id: req.params.id } }).catch((error) => {
    if (error.code === 'P2025') throw new AppError('Backup not found.', 404);
    throw error;
  });
  res.json({ success: true, message: 'Backup snapshot deleted.' });
});
