# Kelvin Eco Products Admin Permissions

## Current Role Model

The current Prisma schema defines:

| Role | Current Meaning |
| --- | --- |
| `SUPER_ADMIN` | Full administrative access |
| `ADMIN` | General admin access |

Most protected backend routes currently authorize admin-level access with these roles.

## Target Permission Principle

Roles should control what an admin can view, create, edit, publish, delete, export, and configure.

Do not expose destructive actions such as user deletion, settings changes, or backups to every admin account.

## Recommended Target Roles

| Role | Purpose |
| --- | --- |
| `SUPER_ADMIN` | Owner-level control over all modules, users, roles, settings, and backups |
| `ADMIN` | Day-to-day content/product management |
| `CONTENT_MANAGER` | Pages, blogs, SEO drafts, media |
| `SALES_MANAGER` | Leads, inquiries, quote requests, customers, quotations |
| `SEO_MANAGER` | SEO metadata, redirects, sitemap controls |
| `VIEWER` | Read-only dashboard and records |

These can be introduced later through a `RolePermission` model while preserving the existing `SUPER_ADMIN` and `ADMIN` enum values.

## Permission Matrix

| Module | SUPER_ADMIN | ADMIN | CONTENT_MANAGER | SALES_MANAGER | SEO_MANAGER | VIEWER |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Full | View | View | View | View | View |
| Products | Full | Full | View | View | View | View |
| Categories | Full | Full | View | View | View | View |
| Media Library | Full | Full | Upload/Edit | View | View | View |
| Pages | Full | Full | Full | View | View | View |
| Menus | Full | Edit | Edit | View | View | View |
| Blogs | Full | Full | Full | View | SEO fields | View |
| SEO | Full | Edit | Draft/Edit | View | Full | View |
| Testimonials | Full | Full | Edit | View | View | View |
| Certifications | Full | Full | Edit | View | View | View |
| Export Markets | Full | Full | Edit | View | View | View |
| Contact Enquiries | Full | View/Edit | View | Full | View | View |
| Quote Requests | Full | View/Edit | View | Full | View | View |
| Quotations | Full | View/Edit | View | Full | View | View |
| Leads | Full | View/Edit | View | Full | View | View |
| Customers | Full | View/Edit | View | Full | View | View |
| Newsletter | Full | View/Edit | View | Full | View | View |
| Analytics | Full | View | View | View | View | View |
| Users | Full | No | No | No | No | No |
| Roles | Full | No | No | No | No | No |
| Activity Logs | Full | View | No | No | No | No |
| Settings | Full | Limited | No | No | SEO settings only | No |
| Backups | Full | No | No | No | No | No |

## Required Backend Checks

Every admin write endpoint should enforce:

1. Valid JWT.
2. Existing admin account.
3. Active role.
4. Permission for the requested module/action.
5. Activity log entry after successful mutation.

## Destructive Action Rules

| Action | Required Role |
| --- | --- |
| Delete product/category/blog/page | `SUPER_ADMIN` or configured delete permission |
| Archive content | `ADMIN` or higher |
| Change site settings | `SUPER_ADMIN` |
| Create admin user | `SUPER_ADMIN` |
| Change admin role | `SUPER_ADMIN` |
| Export customer/lead records | `SUPER_ADMIN` or `SALES_MANAGER` |
| Run backup/export | `SUPER_ADMIN` |

## Activity Logging

Log these fields for every protected write:

| Field | Purpose |
| --- | --- |
| `adminId` | Who performed the action |
| `module` | Products, blogs, settings, etc. |
| `action` | Create, update, delete, publish, archive, login |
| `entityType` | Product, Blog, Page, Inquiry |
| `entityId` | Affected record ID |
| `metadata` | Changed fields, IP, user agent |
| `createdAt` | Timestamp |

## Frontend UI Rules

1. Hide disabled modules from navigation or mark them clearly as unavailable.
2. Disable buttons for actions the current role cannot perform.
3. Never rely on frontend-only permission checks.
4. Show clear permission errors from backend `403` responses.
