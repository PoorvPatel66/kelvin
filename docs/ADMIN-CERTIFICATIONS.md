# Admin Certifications

The Certifications module controls verified company documents displayed on the public Quality page.

## Admin Route

Open `/admin/certifications` after signing in. `ADMIN` and `SUPER_ADMIN` users can create, edit, order, publish, unpublish, and soft-delete certification records.

## Managed Fields

- Title and description
- Issuer and certificate number
- Issue and expiry dates
- Certification image, uploaded to Cloudinary or provided as an HTTPS URL
- Public PDF/document URL
- Status: `DRAFT`, `ACTIVE`, or `INACTIVE`
- Display order

Only verified records should be published as `ACTIVE`. The seed removes old placeholder certification claims and does not create replacement claims.

## Public Behavior

The Quality page requests `GET /api/v1/certifications`. Only active, non-deleted records are returned. If no verified records exist, the Certifications section is omitted completely.

## API Routes

- `GET /api/v1/certifications`
- `GET /api/v1/admin/certifications`
- `POST /api/v1/admin/certifications`
- `PUT /api/v1/admin/certifications/:id`
- `DELETE /api/v1/admin/certifications/:id`
- `POST /api/v1/admin/certificates/:id/icon`
- `DELETE /api/v1/admin/certificates/:id/icon`

All admin routes require an authenticated `ADMIN` or `SUPER_ADMIN` account.

## Database Migration

Apply `20260813170000_add_certification_management` before using the module in a deployment environment, then regenerate the Prisma client.
