import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ApiError } from '../lib/http.js';
import { safeEqual } from '../lib/crypto.js';
import User from '../models/User.js';

export const ROLES = ['owner', 'admin', 'editor'];

export async function requireAuth(req, _res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized();
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET, { audience: 'appilabs-admin' });
    } catch {
      throw ApiError.unauthorized('Session expired. Sign in again.');
    }
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.active) throw ApiError.unauthorized();
    req.user = { id: String(user._id), role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

export function requireApiKey(req, _res, next) {
  const key = req.get('x-api-key');
  if (!env.AUTOMATION_API_KEY) return next(new ApiError(503, 'not_configured', 'AUTOMATION_API_KEY is not configured on the server'));
  if (!key || !safeEqual(key, env.AUTOMATION_API_KEY)) return next(ApiError.unauthorized('Invalid API key'));
  next();
}
