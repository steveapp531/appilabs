import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Vercel API entrypoint', () => {
  it('serves health without opening a database connection', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
