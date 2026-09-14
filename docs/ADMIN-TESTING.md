# Kelvin Eco Products Admin Testing

## Purpose

This checklist verifies that the admin CMS controls the public website and that protected business workflows work end-to-end.

## Command Checks

Run from the project root unless otherwise noted.

### Frontend Build

```powershell
cd frontend
npm.cmd run build
```

Expected result: Vite production build completes without errors.

### Backend Tests

```powershell
cd backend
npm.cmd test
```

Expected result: Jest/Supertest suite passes.

### Prisma Generate

```powershell
cd backend
npx.cmd prisma generate --schema prisma/schema.prisma
```

Expected result: Prisma Client is generated.

### Prisma Migration

```powershell
cd backend
npx.cmd prisma migrate dev --schema prisma/schema.prisma
```

Expected result: Migration applies to the configured PostgreSQL database.

If migration fails with `P1001`, PostgreSQL is not reachable. Check that the database is running and that `DATABASE_URL` points to the correct host and port.

## Authentication Tests

| Test | Expected Result |
| --- | --- |
| Visit `/admin` without token | Redirects to `/admin/login` |
| Login with valid admin credentials | Redirects to dashboard |
| Login with invalid password | Shows clear invalid credentials message |
| Refresh admin dashboard | Session remains valid if token is valid |
| Expire/remove token | Redirects to login |
| Non-admin token | Backend returns unauthorized/forbidden |

## Product CMS Tests

| Test | Expected Result |
| --- | --- |
| Create product in admin | Product record appears in admin list |
| Upload product image | Cloudinary upload succeeds and media URL is saved |
| Edit product title | Public product page reflects new title |
| Edit product image | Public product card/detail reflects new image |
| Change category | Product filter/category updates on public page |
| Mark product featured | Featured product section updates |
| Soft delete product | Product disappears from public listing but remains recoverable |
| Duplicate slug | Backend returns validation error |

## Blog CMS Tests

| Test | Expected Result |
| --- | --- |
| Create draft blog | Not visible publicly |
| Publish blog | Visible on blog list |
| Edit blog title/excerpt | Public blog reflects changes |
| Upload thumbnail | Public blog card shows uploaded image |
| Edit SEO metadata | Page head updates |
| Archive blog | Removed from public listing |

## Page CMS Tests

| Test | Expected Result |
| --- | --- |
| Edit home hero heading | Home page updates after refresh |
| Edit about who-we-are text | About page updates after refresh |
| Hide a section | Section no longer renders publicly |
| Reorder page sections | Public page order updates |
| Replace section image | New image appears publicly |

## Menu and Footer Tests

| Test | Expected Result |
| --- | --- |
| Add header menu item | New item appears in navbar |
| Reorder menu item | Navbar order changes |
| Disable menu item | Link disappears publicly |
| Edit footer contact number | Footer updates |
| Edit social link | Social icon opens correct URL |

## Inquiry and Quote Tests

| Test | Expected Result |
| --- | --- |
| Submit contact form | Inquiry appears in admin inbox |
| Submit request quote modal | Quote request appears in admin quote inbox |
| Select product in quote form | Product name is stored |
| Submit with required fields missing | Validation prevents submit |
| Admin changes inquiry status | Status persists |
| Admin exports CSV | CSV downloads with correct fields |
| Backend email enabled | Notification email is sent |

## SEO Tests

| Test | Expected Result |
| --- | --- |
| Page meta title | Correct title appears in document head |
| Meta description | Correct description appears |
| Canonical URL | Correct canonical link appears |
| OpenGraph image | Correct OG image appears |
| JSON-LD schema | Valid structured data renders |
| Sitemap | Includes published pages/products/blogs only |
| Robots | Matches production index rules |

## Responsive Tests

Check these viewport widths:

- 375px mobile
- 430px large mobile
- 768px tablet
- 1024px small desktop
- 1440px desktop

Verify:

1. Public navbar works.
2. Product detail popup fits screen.
3. Request quote popup fits screen.
4. Contact form is usable.
5. Admin tables/forms are usable.
6. Buttons remain touch-friendly.
7. No horizontal scroll appears unless intentional.

## Acceptance Criteria

The CMS milestone is accepted only when:

1. Admin login works with seeded credentials.
2. Admin can manage at least one full public content domain.
3. Public page reads from the database-backed API.
4. Build passes.
5. API validation and role protection work.
6. No placeholder admin module is presented as complete.
7. The current public website design remains intact.
