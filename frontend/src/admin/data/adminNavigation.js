import { FileText, Mail, Newspaper, Package } from 'lucide-react';

export const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'SEO_MANAGER', 'VIEWER'];
export const WEBSITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SEO_MANAGER'];
export const CONTENT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SEO_MANAGER'];
export const CATALOG_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'];
export const SALES_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'];

export const adminNavigation = [
  {
    label: 'Manage website',
    items: [
      { label: 'About', path: '/admin/about', icon: FileText, roles: WEBSITE_ROLES },
      { label: 'Products', path: '/admin/products', icon: Package, roles: CATALOG_ROLES },
      { label: 'Contact', path: '/admin/contact', icon: Mail, roles: SALES_ROLES },
      { label: 'Blog', path: '/admin/blog', icon: Newspaper, roles: CONTENT_ROLES }
    ]
  }
];
