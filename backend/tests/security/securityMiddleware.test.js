import express from 'express';
import request from 'supertest';
import {
  csrfProtection,
  csrfTokenHandler,
  sqlInjectionGuard,
  xssSanitizer
} from '../../src/middleware/securityMiddleware.js';
import { errorHandler } from '../../src/middleware/errorMiddleware.js';

function createSecurityTestApp() {
  const app = express();

  app.use(express.json());
  app.get('/csrf-token', csrfTokenHandler);
  app.post('/sanitize', xssSanitizer, (req, res) => res.status(200).json(req.body));
  app.get('/search', sqlInjectionGuard, (req, res) => res.status(200).json({ success: true }));
  app.post('/csrf', csrfProtection, (req, res) => res.status(200).json({ success: true }));
  app.use(errorHandler);

  return app;
}

describe('Security middleware', () => {
  it('sanitizes script payloads in request bodies', async () => {
    const response = await request(createSecurityTestApp())
      .post('/sanitize')
      .send({ message: '<script>alert(1)</script>', safe: 'Paper Cups' })
      .expect(200);

    expect(response.body.message).not.toContain('<script>');
    expect(response.body.safe).toBe('Paper Cups');
  });

  it('blocks SQL injection-like query parameters', async () => {
    const response = await request(createSecurityTestApp())
      .get('/search?q=paper%20cups%27%20UNION%20SELECT')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Request contains unsafe query patterns.');
  });

  it('issues CSRF tokens', async () => {
    const response = await request(createSecurityTestApp()).get('/csrf-token').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.csrfToken).toHaveLength(64);
    expect(response.headers['set-cookie'][0]).toContain('csrf_token=');
  });

  it('rejects unsafe requests when CSRF protection is enabled', async () => {
    process.env.CSRF_PROTECTION = 'true';

    const response = await request(createSecurityTestApp()).post('/csrf').send({ ok: true }).expect(403);

    expect(response.body.message).toBe('Invalid CSRF token.');
    process.env.CSRF_PROTECTION = 'false';
  });
});
