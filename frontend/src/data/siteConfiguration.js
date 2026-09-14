export const fallbackSiteSettings = {
  siteName: 'Kelvin Eco Products',
  tagline: 'Think Green. Pack Smart.',
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
    facebook: 'https://facebook.com/kelvinecoproducts', instagram: 'https://instagram.com/kelvinecoproducts',
    linkedin: 'https://linkedin.com/company/kelvinecoproducts', youtube: 'https://youtube.com/@kelvinecoproducts',
    twitter: 'https://x.com/kelvinecoproducts'
  }
};

export const fallbackNavigation = [
  { label: 'HOME', path: '/', area: 'HEADER', sortOrder: 10 }, { label: 'ABOUT', path: '/about', area: 'HEADER', sortOrder: 20 },
  { label: 'PRODUCTS', path: '/products', area: 'HEADER', sortOrder: 30 }, { label: 'BLOG', path: '/blog', area: 'HEADER', sortOrder: 40 },
  { label: 'CONTACT', path: '/contact', area: 'HEADER', sortOrder: 50 },
  { label: 'Products', path: '/products', area: 'FOOTER_QUICK', sortOrder: 10 }, { label: 'Request Quote', path: '/request-quote', area: 'FOOTER_QUICK', sortOrder: 20 },
  { label: 'About Us', path: '/about', area: 'FOOTER_QUICK', sortOrder: 30 }, { label: 'Blog', path: '/blog', area: 'FOOTER_QUICK', sortOrder: 40 },
  { label: 'Contact Us', path: '/contact', area: 'FOOTER_QUICK', sortOrder: 50 },
  { label: 'Terms & Conditions', path: 'https://kelvinecoproducts.com/terms-and-conditions', area: 'FOOTER_MORE', sortOrder: 10, isExternal: true },
  { label: 'Privacy Policy', path: 'https://kelvinecoproducts.com/privacy-policy', area: 'FOOTER_MORE', sortOrder: 20, isExternal: true },
  { label: 'FAQs', path: 'https://kelvinecoproducts.com/faqs', area: 'FOOTER_MORE', sortOrder: 30, isExternal: true },
  { label: 'Custom Printing', path: '/products', area: 'FOOTER_SERVICES', sortOrder: 10 }, { label: 'Bulk Supply', path: '/contact', area: 'FOOTER_SERVICES', sortOrder: 20 },
  { label: 'Product Development', path: '/contact', area: 'FOOTER_SERVICES', sortOrder: 30 }, { label: 'Export Solutions', path: '/#export', area: 'FOOTER_SERVICES', sortOrder: 40 }
];
