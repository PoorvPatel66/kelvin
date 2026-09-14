# Kelvin Admin Website Controls

This document describes the completed shared website-controls milestone. It does not mark the entire admin roadmap complete; remaining modules are tracked in [ADMIN-REBUILD-AUDIT.md](./ADMIN-REBUILD-AUDIT.md).

## What Is Connected

- **Site Settings** (`/admin/site-settings`): site name, tagline, logo, footer description, contact details, office address, business hours, and social links.
- **Navigation** (`/admin/navigation`): header links and the Quick Links, More Links, and Services footer columns.
- **Public website**: the navbar and footer load these records through public APIs and retain the current local values as outage fallbacks.

## Required Environment Values

The seed intentionally requires a database-backed owner account. Configure these values in `backend/.env` before seeding:

```env
OWNER_NAME=vasu poorv
OWNER_PASSWORD=replace-with-a-strong-private-password
OWNER_ADMIN_EMAIL=your-private-admin-email@example.com
OWNER_MOBILE=10-digit-mobile-number
```

Do not commit real credentials to source control.

## Apply the Database Changes

From the project root in PowerShell:

```powershell
docker compose up -d postgres
cd backend
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd run seed
```

The current workspace maps PostgreSQL to `127.0.0.1:5433`. Docker Desktop must be running before these commands can reach the database.

## Run the Application

Backend:

```powershell
cd "D:\office work\product\kelvin\backend"
npm.cmd run dev
```

Frontend in a second terminal:

```powershell
cd "D:\office work\product\kelvin\frontend"
npm.cmd run dev
```

Open the frontend URL shown by Vite, sign in through the existing admin login flow, then use **Site Settings** or **Navigation** in the admin sidebar.

## API Reference

Public:

- `GET /api/v1/site-settings`
- `GET /api/v1/navigation`

Protected admin:

- `GET /api/v1/admin/site-settings`
- `PUT /api/v1/admin/site-settings`
- `GET /api/v1/admin/navigation`
- `POST /api/v1/admin/navigation`
- `PUT /api/v1/admin/navigation/:id`
- `DELETE /api/v1/admin/navigation/:id`

Navigation accepts the areas `HEADER`, `FOOTER_QUICK`, `FOOTER_MORE`, and `FOOTER_SERVICES`. Use `sortOrder` to control display order and `isVisible` to publish or hide an item.

## Verification Snapshot

Verified again on 2026-08-13:

- Prisma schema validation passes.
- Backend: 10 test suites and 22 tests pass.
- Frontend production build passes.
- All 5 local migrations are applied and the database is up to date.
- The seed completes and preserves the database-backed owner, site controls, testimonials, and export markets.
