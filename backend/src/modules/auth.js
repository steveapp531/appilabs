import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import env from '../config/env.js';
import { User, Session } from '../models/index.js';
import { asyncHandler, send, ApiError } from '../lib/http.js';
import { randomToken, sha256, safeEqual } from '../lib/crypto.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { audit } from '../services/audit.js';
import { email, name } from './schemas.js';

const r = Router();
const COOKIE = 'apl_rt';
const DUMMY_HASH = bcrypt.hashSync('appilabs-timing-guard', 10);
export const passwordSchema = z.string().min(10, 'Use at least 10 characters').max(200);

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  // Frontend (Vercel) and API (Render) are different sites in production, so the cookie must be SameSite=None + Secure.
  sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_DAYS * 86400000,
});

const signAccess = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL, audience: 'appilabs-admin' });

async function startSession(req, res, user) {
  const raw = randomToken(48);
  await Session.create({
    user: user._id,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400000),
    userAgent: req.get('user-agent')?.slice(0, 200),
    ip: req.ip,
  });
  res.cookie(COOKIE, raw, cookieOptions());
  return { accessToken: signAccess(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

// CSRF defence for cookie-based endpoints: require a custom header (cannot be sent cross-site
// without a CORS preflight, which our allowlist rejects) and, when present, an allowed Origin.
function csrfGuard(req, _res, next) {
  const origin = req.get('origin');
  if (req.get('x-requested-with') !== 'appilabs') return next(ApiError.forbidden('Missing CSRF header'));
  if (origin && !env.corsOrigins.includes(origin)) return next(ApiError.forbidden('Origin not allowed'));
  next();
}

r.get('/setup-status', asyncHandler(async (_req, res) => {
  const count = await User.countDocuments();
  send(res, { needsSetup: count === 0, setupEnabled: Boolean(env.SETUP_TOKEN) });
}));

r.post(
  '/setup',
  authLimiter,
  validate({ body: z.object({ setupToken: z.string().min(1), name, email, password: passwordSchema }) }),
  asyncHandler(async (req, res) => {
    if (!env.SETUP_TOKEN) throw new ApiError(403, 'setup_disabled', 'Set SETUP_TOKEN on the server to enable first-time setup, or run npm run create-admin.');
    if (!safeEqual(req.body.setupToken, env.SETUP_TOKEN)) throw ApiError.forbidden('Setup token is incorrect');
    if ((await User.countDocuments()) > 0) throw ApiError.conflict('An administrator already exists. Sign in instead.');
    const user = await User.create({ name: req.body.name, email: req.body.email, role: 'owner', passwordHash: await bcrypt.hash(req.body.password, 12) });
    req.user = { id: String(user._id), email: user.email };
    await audit(req, 'setup_owner', 'user', user._id);
    send(res, await startSession(req, res, user), { status: 201 });
  }),
);

r.post(
  '/login',
  authLimiter,
  validate({ body: z.object({ email, password: z.string().min(1).max(200) }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    const ok = await bcrypt.compare(req.body.password, user?.passwordHash || DUMMY_HASH);
    if (!user || !ok || !user.active) throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect');
    user.lastLoginAt = new Date();
    await user.save();
    req.user = { id: String(user._id), email: user.email };
    await audit(req, 'login', 'user', user._id);
    send(res, await startSession(req, res, user));
  }),
);

r.post(
  '/refresh',
  csrfGuard,
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[COOKIE];
    if (!raw) throw ApiError.unauthorized('No active session');
    const session = await Session.findOne({ tokenHash: sha256(raw) });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined });
      throw ApiError.unauthorized('Session expired. Sign in again.');
    }
    const user = await User.findById(session.user);
    if (!user?.active) throw ApiError.unauthorized();
    session.revokedAt = new Date(); // rotate refresh token on every use
    await session.save();
    send(res, await startSession(req, res, user));
  }),
);

r.post('/logout', csrfGuard, asyncHandler(async (req, res) => {
  const raw = req.cookies?.[COOKIE];
  if (raw) await Session.updateOne({ tokenHash: sha256(raw) }, { revokedAt: new Date() });
  res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
}));

r.get('/me', requireAuth, (req, res) => send(res, req.user));

r.post(
  '/change-password',
  requireAuth,
  validate({ body: z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw ApiError.badRequest('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    await Session.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
    await audit(req, 'change_password', 'user', user._id);
    res.status(204).end();
  }),
);

export default r;
