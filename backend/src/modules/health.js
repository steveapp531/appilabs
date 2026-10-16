import { Router } from 'express';
import mongoose from 'mongoose';
import env from '../config/env.js';
import { isDbReady } from '../config/db.js';
import { getPaymentProvider } from '../services/payments/index.js';

const r = Router();
const started = Date.now();

r.get('/health', (_req, res) => res.json({ status: 'ok', uptimeSeconds: Math.round((Date.now() - started) / 1000) }));

r.get('/ready', async (_req, res) => {
  let db = false;
  try {
    db = isDbReady() && Boolean(await mongoose.connection.db.admin().ping());
  } catch {
    db = false;
  }
  res.status(db ? 200 : 503).json({
    status: db ? 'ready' : 'not_ready',
    checks: { database: db ? 'ok' : 'unavailable' },
    integrations: {
      email: env.EMAIL_DRIVER,
      payments: getPaymentProvider()?.name ?? 'disabled',
      storage: env.STORAGE_DRIVER,
      automation: env.AUTOMATION_API_KEY ? 'configured' : 'not_configured',
    },
  });
});

export default r;
