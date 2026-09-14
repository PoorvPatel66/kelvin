import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SETTINGS_ID = 'primary';

const defaults = {
  id: SETTINGS_ID,
  siteName: 'Kelvin Eco Products',
  tagline: 'Think Green. Pack Smart.',
  logoUrl: null,
  footerDescription: 'Kelvin Eco Products is a leading manufacturer of premium eco-friendly packaging solutions. We serve businesses worldwide with sustainable and innovative packaging.',
  primaryPhone: '+91 9687 503514',
  alternatePhone: '+91 7048 503513',
  primaryEmail: 'info@kelvinecoproducts.in',
  alternateEmail: 'kelvinecoproducts@gmail.com',
  websiteUrl: 'https://kelvinecoproducts.in',
  whatsappNumber: '919687503514',
  headOffice: '105, Maruti Arcade-1, Shivam International Zone-1, Kalavad Road, Chhapra, Rajkot - 360021, Gujarat, India',
  corporateOffice: '71-75 Shelton Street, Covent Garden, London, United Kingdom, WC2H 9JQ',
  businessHours: '9:00 AM - 6:00 PM',
  socialLinks: {
    facebook: 'https://facebook.com/kelvinecoproducts',
    instagram: 'https://instagram.com/kelvinecoproducts',
    linkedin: 'https://linkedin.com/company/kelvinecoproducts',
    youtube: 'https://youtube.com/@kelvinecoproducts',
    twitter: 'https://x.com/kelvinecoproducts'
  }
};

function buildData(body) {
  const data = {};
  for (const key of Object.keys(defaults)) {
    if (key !== 'id' && key !== 'socialLinks' && body[key] !== undefined) {
      data[key] = String(body[key]).trim();
    }
  }
  if (body.socialLinks !== undefined) data.socialLinks = body.socialLinks;
  return data;
}

export const getPublicSiteSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.siteSetting.findUnique({ where: { id: SETTINGS_ID } });
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({ success: true, settings: settings || defaults });
});

export const getAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.siteSetting.findUnique({ where: { id: SETTINGS_ID } });
  res.status(200).json({ success: true, settings: settings || defaults });
});

export const updateAdminSiteSettings = asyncHandler(async (req, res) => {
  const data = buildData(req.body);
  const settings = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { ...defaults, ...data, id: SETTINGS_ID }
  });
  res.status(200).json({ success: true, message: 'Site settings updated.', settings });
});
