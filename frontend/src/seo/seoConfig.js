export const siteConfig = {
  name: 'Kelvin Eco Products',
  legalName: 'Kelvin Eco Products',
  url: import.meta.env.VITE_SITE_URL || 'https://kelvinecoproducts.com',
  logo: '/logo.svg',
  defaultImage: '/og-image.svg',
  email: 'sales@kelvinecoproducts.com',
  phone: '+91 99999 99999',
  addressCountry: 'IN',
  sameAs: [
    'https://www.linkedin.com/company/kelvin-eco-products',
    'https://www.facebook.com/kelvinecoproducts',
    'https://www.instagram.com/kelvinecoproducts'
  ],
  defaultTitle: 'Kelvin Eco Products | Eco-Friendly Packaging Manufacturer and Exporter',
  defaultDescription:
    'Kelvin Eco Products manufactures and exports eco-friendly paper cups, containers, pizza boxes, salad bowls, meal boxes, tea flasks, plastic lids, and custom printed packaging.'
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const cleanBase = siteConfig.url.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
