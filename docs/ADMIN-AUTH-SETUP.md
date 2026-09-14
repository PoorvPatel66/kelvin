# Secure Admin Owner Login Setup

The owner login uses four server-validated values: owner name, registered mobile number, password, and a one-time SMS code. It intentionally fails closed when the database owner or SMS provider is not configured.

## 1. Configure Environment Variables

Copy the required names from `backend/.env.example` into `backend/.env` and supply private values locally or in the deployment secret manager:

- `DATABASE_URL`
- `JWT_SECRET`
- `OWNER_NAME`
- `OWNER_EMAIL`
- `OWNER_MOBILE`
- `OWNER_PASSWORD`
- `OTP_HASH_SECRET`
- `SMS_PROVIDER_URL`
- `SMS_PROVIDER_API_KEY`
- `SMS_SENDER_ID`

Never put these values in frontend environment files, documentation, source control, API responses, or logs.

## 2. Apply the Database Migration

Run from `backend` in PowerShell:

```powershell
npx.cmd prisma migrate dev
npx.cmd prisma generate
```

The PostgreSQL server in `DATABASE_URL` must be running and reachable before migration.

## 3. Seed the Owner Record

```powershell
npm.cmd run seed
```

The seed hashes `OWNER_PASSWORD` with bcrypt and creates or updates the owner by `OWNER_EMAIL`. It does not store the plaintext password.

## 4. Start and Test

```powershell
npm.cmd run dev
```

Open `/admin/login`, enter the configured owner name, mobile, and password, request the OTP, then enter the code delivered by the SMS provider. If SMS delivery is not configured or fails, the API returns an error and does not bypass OTP.

## Common Login Failures

- `Invalid owner credentials`: the owner seed is missing, inactive, not `SUPER_ADMIN`, or the name/mobile/password do not match the database record.
- OTP request unavailable: the SMS provider variables are absent or the provider rejected delivery.
- Prisma cannot reach PostgreSQL: start PostgreSQL and verify the host and port in `DATABASE_URL`.
- Prisma schema or client mismatch: rerun migration and `npx.cmd prisma generate` from `backend`.
