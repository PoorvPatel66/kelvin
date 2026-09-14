import request from 'supertest';
import app from '../../src/app.js';

describe('Security headers', () => {
  it('sets Helmet security headers and hides Express fingerprinting', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('rejects origins outside the allowed CORS list', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://malicious.example')
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('CORS policy blocked this origin.');
  });
});
