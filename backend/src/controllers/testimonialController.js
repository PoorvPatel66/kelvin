import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const editableFields = [
  'name',
  'role',
  'company',
  'quote',
  'sourceUrl',
  'avatarUrl',
  'rating',
  'featured',
  'status',
  'sortOrder'
];

function testimonialData(body) {
  return editableFields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});
}

export const getTestimonials = asyncHandler(async (req, res) => {
  const where = { isDeleted: false, status: 'ACTIVE' };
  if (req.query.featured !== undefined) where.featured = req.query.featured === 'true';

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({ success: true, testimonials });
});

export const getAdminTestimonials = asyncHandler(async (req, res) => {
  const where = { isDeleted: false };
  if (req.query.status) where.status = req.query.status;
  if (req.query.q) {
    where.OR = [
      { name: { contains: req.query.q, mode: 'insensitive' } },
      { role: { contains: req.query.q, mode: 'insensitive' } },
      { company: { contains: req.query.q, mode: 'insensitive' } },
      { quote: { contains: req.query.q, mode: 'insensitive' } }
    ];
  }

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });

  res.status(200).json({ success: true, testimonials });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.create({ data: testimonialData(req.body) });
  res.status(201).json({ success: true, message: 'Testimonial created.', testimonial });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: testimonialData(req.body)
    });
    res.status(200).json({ success: true, message: 'Testimonial updated.', testimonial });
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('Testimonial not found.', 404);
    throw error;
  }
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  try {
    await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }
    });
    res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('Testimonial not found.', 404);
    throw error;
  }
});
