import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/src/app.js';

describe('System Health & Infrastructure Tests', () => {
  const app = createApp();

  it('GET /api/v1/health should return 200 with system status and service details', async () => {
    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('geminiConfigured');
    expect(res.body.services).toHaveProperty('geminiModel');
    expect(res.body.services).toHaveProperty('supabaseConfigured');
    expect(res.body).toHaveProperty('system');
  });

  it('GET /api/health should return 200 for standard compatibility', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should include HTTP security headers from Helmet', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  it('GET /non-existent-route should return 404 with structured error response', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error.message).toContain('Cannot GET /non-existent-route');
  });
});
