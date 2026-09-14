# Testing And Security System

## Install Commands

Backend:

```bash
npm install helmet compression
npm install --save-dev jest supertest cross-env
npm install @prisma/client@^6.16.0 prisma@^6.16.0
npx prisma generate
```

Frontend audits:

```bash
npm install --save-dev @lhci/cli pa11y
```

## Backend Scripts

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Frontend Audit Scripts

```bash
npm run build
npm run audit:lighthouse
npm run audit:a11y
```

`audit:lighthouse` uses `lighthouserc.cjs` and checks performance, accessibility, best practices, SEO, LCP, FCP, TBT, and CLS.

`audit:a11y` uses Pa11y against the Vite preview server and checks WCAG 2.1 AA issues.

## Test Architecture

`src/app.js` exports the Express app without opening a port.

`src/server.js` only connects Prisma and starts listening. This keeps production startup clean and lets Supertest import the app directly.

Test folders:

- `tests/api` for endpoint integration tests.
- `tests/security` for security middleware and rate limiting tests.
- `tests/unit` for isolated utility tests.

## Security Middleware

`middleware/securityMiddleware.js` provides:

- Helmet headers
- Compression
- Strict CORS allow-list
- XSS sanitization
- SQL injection pattern blocking for query and route params
- CSRF token issuing
- Optional CSRF enforcement

Enable CSRF enforcement in production only after the frontend sends the token:

```env
CSRF_PROTECTION=true
```

Frontend flow:

1. Call `GET /api/v1/csrf-token`.
2. Store the returned token in memory.
3. Send it as `X-CSRF-Token` on unsafe requests.
4. The backend compares it with the `csrf_token` cookie.

## Rate Limiting

Existing limiters:

- Login: 5 attempts per 15 minutes.
- Inquiry forms: 20 submissions per 15 minutes.

The test suite verifies the login limiter returns `429` after repeated attempts.

## CORS

Use `CLIENT_URLS` for multiple origins:

```env
CLIENT_URLS=http://localhost:5173,https://kelvinecoproducts.com
```

If `CLIENT_URLS` is not set, the app falls back to `CLIENT_URL` and local Vite origins.

## SQL Injection Prevention

Primary protection is Prisma query parameterization.

Additional protection:

- Validation middleware rejects invalid fields.
- `sqlInjectionGuard` blocks dangerous SQL-like patterns in query and route params.

## XSS Protection

Primary protection:

- React escapes rendered text by default.
- Backend validation limits accepted data shapes.

Additional protection:

- Helmet sets browser security headers.
- `xssSanitizer` removes obvious script vectors from incoming JSON values.

## Logging

`loggerMiddleware.js` logs method, URL, status, and duration outside test mode.

Production recommendation:

- Send logs to Render logs, Datadog, Logtail, or another centralized logging service.
- Add request IDs before scaling horizontally.

## Dependency Security

Run periodically:

```bash
npm audit
npm audit fix
```

Use `npm audit fix --force` only after reviewing breaking changes.

## Production Checklist

- Set `NODE_ENV=production`.
- Set `CLIENT_URLS` to trusted frontend origins.
- Set strong `JWT_SECRET`.
- Enable `CSRF_PROTECTION=true` after frontend CSRF token wiring.
- Keep Prisma pinned to v6 unless migrating to Prisma 7 config and driver adapters.
- Run `npm test` before deployment.
- Run Lighthouse and Pa11y before launch.
