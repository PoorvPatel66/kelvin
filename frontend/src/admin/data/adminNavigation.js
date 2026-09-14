import {
  ClipboardList,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  Settings,
  Menu,
  Package,
  MessageSquareQuote,
  Globe2,
  BadgeCheck,
  SearchCheck,
  Users,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  DatabaseBackup,
  FileDown,
  FileSignature,
  History,
  ShieldCheck,
  Palette,
} from 'lucide-react';

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'SEO_MANAGER', 'VIEWER'];
const WEBSITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SEO_MANAGER'];
const CONTENT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SEO_MANAGER'];
const CATALOG_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'];
const SALES_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'];
const ANALYTICS_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SEO_MANAGER', 'VIEWER'];

export const adminNavigation = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ALL_ROLES }]
  },
  {
    label: 'Website',
    items: [
      { label: 'Pages', path: '/admin/pages', icon: FileText, roles: WEBSITE_ROLES },
      { label: 'Customization', path: '/admin/customization', icon: Palette, roles: WEBSITE_ROLES },
      { label: 'Navigation', path: '/admin/navigation', icon: Menu, roles: WEBSITE_ROLES },
      { label: 'SEO Manager', path: '/admin/seo', icon: SearchCheck, roles: WEBSITE_ROLES },
      { label: 'Site Settings', path: '/admin/site-settings', icon: Settings, roles: WEBSITE_ROLES },
      { label: 'Media Library', path: '/admin/media', icon: Image, roles: CONTENT_ROLES }
    ]
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', path: '/admin/products', icon: Package, roles: CATALOG_ROLES },
      { label: 'Product Variants', path: '/admin/variants', icon: Boxes, roles: CATALOG_ROLES },
      { label: 'Categories', path: '/admin/categories', icon: FolderTree, roles: CATALOG_ROLES },
      { label: 'Catalog Downloads', path: '/admin/catalogs', icon: FileDown, roles: CATALOG_ROLES }
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Blogs', path: '/admin/blogs', icon: Newspaper, roles: CONTENT_ROLES },
      { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote, roles: CONTENT_ROLES },
      { label: 'Certifications', path: '/admin/certifications', icon: BadgeCheck, roles: CONTENT_ROLES }
    ]
  },
  {
    label: 'Sales',
    items: [
      { label: 'Customers', path: '/admin/customers', icon: Users, roles: SALES_ROLES },
      { label: 'Leads', path: '/admin/leads', icon: Mail, roles: SALES_ROLES },
      { label: 'Quote Requests', path: '/admin/quotes', icon: ClipboardList, roles: SALES_ROLES },
      { label: 'Quotations', path: '/admin/quotations', icon: FileSignature, roles: SALES_ROLES },
      { label: 'Contact Enquiries', path: '/admin/contact-enquiries', icon: Mail, roles: SALES_ROLES }
    ]
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Export Markets', path: '/admin/export-markets', icon: Globe2, roles: CONTENT_ROLES },
      { label: 'Newsletter', path: '/admin/newsletter', icon: Megaphone, roles: SALES_ROLES }
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Notifications', path: '/admin/notifications', icon: Bell, roles: ALL_ROLES },
      { label: 'Analytics', path: '/admin/analytics', icon: ChartNoAxesCombined, roles: ANALYTICS_ROLES },
      { label: 'Activity Log', path: '/admin/activity', icon: History, roles: ANALYTICS_ROLES }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Admin Users', path: '/admin/users', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
      { label: 'Backups', path: '/admin/backups', icon: DatabaseBackup, roles: ['SUPER_ADMIN'] }
    ]
  }
];
