import request from 'supertest';
import app from '../../src/app.js';

describe('Health API', () => {
  it('returns the API health payload', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Kelvin Eco Products API is running'
    });
  });
});
