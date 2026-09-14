# Admin Export Markets

The Export Markets module controls the country list in the public Global Export Supply section.

## Admin Route

Open `/admin/export-markets` after signing in. Admins can create, edit, publish, draft, deactivate, reorder, search, and delete export-market records.

## Public Behavior

The website requests `GET /api/v1/export-countries`. Active database records are returned in `sortOrder` and country-name order. If the API is unavailable, the existing public country list remains visible as a frontend fallback.

## API Routes

- `GET /api/v1/export-countries`
- `GET /api/v1/admin/export-countries`
- `POST /api/v1/admin/export-countries`
- `PUT /api/v1/admin/export-countries/:id`
- `DELETE /api/v1/admin/export-countries/:id`

All admin routes require an authenticated `ADMIN` or `SUPER_ADMIN` account.

## Editable Fields

- Country name
- Flag image URL
- Status: `ACTIVE`, `INACTIVE`, or `DRAFT`
- Sort order

Flag URLs must be valid `http` or `https` URLs. Duplicate country names return a conflict response instead of silently replacing data.

## Seeded Markets

The seed creates or updates UAE, Saudi Arabia, Oman, Qatar, United Kingdom, Canada, Australia, South Africa, and United States with FlagCDN images. Seed operations are idempotent.

## Verification

On 2026-08-13 the local database contained 9 active export markets. Prisma validation, backend tests, and the frontend production build all passed after this module was connected.
