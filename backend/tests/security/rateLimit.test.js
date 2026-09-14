import express from 'express';
import request from 'supertest';
import { loginRateLimiter } from '../../src/middleware/rateLimitMiddleware.js';

function createRateLimitTestApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.post('/login', loginRateLimiter, (req, res) => {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  });

  return app;
}

describe('Rate limiting', () => {
  it('limits login attempts after five requests', async () => {
    const app = createRateLimitTestApp();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app).post('/login').expect(401);
    }

    const response = await request(app).post('/login').expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many login attempts');
  });
});
