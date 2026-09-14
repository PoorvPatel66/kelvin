# Admin Testimonials

The Testimonials module controls the client-review marquee on the public homepage.

## Admin route

Open `/admin/testimonials` after signing in. Admins can create, edit, order, publish, feature, and soft-delete testimonials.

## Public behavior

The homepage requests `GET /api/v1/testimonials?featured=true`. Only active, non-deleted records are returned. If the API is unavailable or the migration has not been applied, the existing three homepage testimonials remain visible as a frontend fallback.

## API routes

- `GET /api/v1/testimonials`
- `GET /api/v1/admin/testimonials`
- `POST /api/v1/admin/testimonials`
- `PUT /api/v1/admin/testimonials/:id`
- `DELETE /api/v1/admin/testimonials/:id`

All admin routes require an authenticated `ADMIN` or `SUPER_ADMIN` account.

## Database setup

The local migration was verified as applied on 2026-08-13. For another environment, run:

```powershell
cd backend
npx.cmd prisma migrate deploy
npm.cmd run seed
```
