import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const make = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: env.isTest ? 10000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'rate_limited', message } },
  });

// Reads are generous (pages make several GETs, and the frontend build prerenders every page from one IP).
// Writes are stricter; form endpoints have their own tighter limiter below.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: (req) => (env.isTest ? 10000 : req.method === 'GET' ? 3000 : 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many requests. Try again in a few minutes.' } },
});
export const formLimiter = make(15, 20, 'Too many submissions from this network. Try again in 15 minutes.');
export const authLimiter = make(15, 10, 'Too many sign in attempts. Try again in 15 minutes.');
