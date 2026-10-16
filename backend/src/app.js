import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import env from './config/env.js';
import logger from './lib/logger.js';
import { requestId } from './middleware/requestId.js';
import { sanitize } from './middleware/sanitize.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errors.js';
import health from './modules/health.js';
import auth from './modules/auth.js';
import content from './modules/content.js';
import leads from './modules/leads.js';
import enrollments, { paystackWebhook } from './modules/enrollments.js';
import research from './modules/research.js';
import newsletter from './modules/newsletter.js';
import events from './modules/events.js';
import automation from './modules/automation.js';
import admin from './modules/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ beforeApiRoutes } = {}) {
  const app = express();
  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(pinoHttp({ logger, genReqId: (req) => req.id, autoLogging: { ignore: (req) => req.url.endsWith('/health') } }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600,
    }),
  );
  app.use(compression());

  if (beforeApiRoutes) {
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api/v1/') || req.path === '/api/v1/health') return next();
      return beforeApiRoutes(req, res, next);
    });
  }

  // Webhooks need the raw body: mount before JSON parsing.
  app.post('/api/v1/payments/webhook/paystack', ...paystackWebhook);

  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));
  app.use(cookieParser());
  app.use(sanitize);

  const v1 = express.Router();
  v1.use(health);
  v1.use(globalLimiter);
  v1.use('/auth', auth);
  v1.use(content);
  v1.use(leads);
  v1.use(enrollments);
  v1.use(research);
  v1.use(newsletter);
  v1.use(events);
  v1.use('/automation', automation);
  v1.use('/admin', admin);
  app.use('/api/v1', v1);

  // API documentation
  const spec = YAML.parse(fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8'));
  spec.servers = [{ url: `${env.API_PUBLIC_URL}/api/v1` }];
  app.get('/api/openapi.json', (_req, res) => res.json(spec));
  app.use('/api/docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'AppiLabs API' }));

  app.get('/', (_req, res) => res.json({ name: 'AppiLabs API', docs: '/api/docs', health: '/api/v1/health' }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
