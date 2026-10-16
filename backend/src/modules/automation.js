import { Router } from 'express';
import { requireApiKey } from '../middleware/auth.js';
import { asyncHandler, send } from '../lib/http.js';
import * as reports from '../services/reports.js';
import { purgeExpiredUploads } from '../services/uploads.js';

// Machine-to-machine API for scheduled jobs (see /automation). Authenticated with X-API-Key.
const r = Router();
r.use(requireApiKey);
const num = (v, d, max) => Math.min(max, Math.max(1, parseInt(v, 10) || d));

r.get('/stale-inquiries', asyncHandler(async (req, res) => send(res, await reports.staleInquiries(num(req.query.hours, 48, 720)))));
r.get('/daily-summary', asyncHandler(async (req, res) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : undefined;
  send(res, await reports.dailySummary(date));
}));
r.get('/upcoming-bookings', asyncHandler(async (req, res) => send(res, await reports.upcomingBookings(num(req.query.days, 7, 60)))));
r.get('/enrollment-summary', asyncHandler(async (req, res) => send(res, await reports.enrollmentSummary(num(req.query.days, 30, 365)))));
r.get('/weekly-activity', asyncHandler(async (_req, res) => send(res, await reports.weeklyActivity())));
r.post('/purge-uploads', asyncHandler(async (_req, res) => send(res, { purged: await purgeExpiredUploads() })));

export default r;
