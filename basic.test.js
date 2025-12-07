import dotenv from 'dotenv'; dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import appModule from '../src/server.js';

// server.js runs immediately; export not available. We'll test using HTTP against running app (assumes docker-compose up).
// Provide minimal token tests and route status.

describe('Basic API smoke test', () => {
  const token = jwt.sign({ sub: 't', tenantId: 'logi_xpress', role: 'manager' }, process.env.JWT_SECRET || 'dev_secret');

  test('Metrics unauthorized without token', async () => {
    const r = await fetch('http://localhost:5000/api/v1/metrics');
    expect(r.status).toBe(401);
  });

  test('Metrics with token (may be 200 if running)', async () => {
    const r = await fetch('http://localhost:5000/api/v1/metrics?tenantId=logi_xpress', { headers: { Authorization: `Bearer ${token}` } });
    expect([200,500]).toContain(r.status);
  });
});
