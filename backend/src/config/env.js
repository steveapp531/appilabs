import crypto from 'node:crypto';
import { z } from 'zod';

const bool = (def) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => (v === undefined ? def : v === 'true' || v === '1'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default('info'),
  TRUST_PROXY: z.coerce.number().default(1),

  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/appilabs'),

  PUBLIC_SITE_URL: z.string().url().default('http://localhost:5173'),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().optional(),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(7),
  COOKIE_SECURE: bool(false),
  SETUP_TOKEN: z.string().optional(),

  EMAIL_DRIVER: z.enum(['log', 'smtp', 'none']).default('log'),
  EMAIL_FROM: z.string().default('AppiLabs <hello@appilabs.com>'),
  ADMIN_NOTIFY_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: bool(false),

  PAYMENT_PROVIDER: z.enum(['mock', 'paystack', 'none']).default('mock'),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYMENT_CURRENCY: z.string().default('GHS'),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('storage/private'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  UPLOAD_MAX_MB: z.coerce.number().default(10),
  UPLOAD_MAX_FILES: z.coerce.number().default(3),
  UPLOAD_RETENTION_DAYS: z.coerce.number().default(180),

  AUTOMATION_API_KEY: z.string().optional(),
  VERCEL_DEPLOY_HOOK_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;
env.isProd = env.NODE_ENV === 'production';
env.isTest = env.NODE_ENV === 'test';
env.corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  if (env.isProd) {
    console.error('JWT_SECRET must be set to at least 32 characters in production.');
    process.exit(1);
  }
  env.JWT_SECRET = env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  if (!env.isTest) console.warn('[env] JWT_SECRET not set. Using a random development secret; sessions reset on restart.');
}

if (env.isProd && env.PAYMENT_PROVIDER === 'mock') {
  console.warn('[env] PAYMENT_PROVIDER=mock in production. Payments are simulated. Set paystack or none.');
}
if (env.PAYMENT_PROVIDER === 'paystack' && !env.PAYSTACK_SECRET_KEY) {
  console.error('PAYSTACK_SECRET_KEY is required when PAYMENT_PROVIDER=paystack.');
  process.exit(1);
}
if (env.isProd && env.STORAGE_DRIVER === 'local') {
  console.warn('[env] STORAGE_DRIVER=local in production. Serverless and ephemeral filesystems do not persist uploads. Use s3.');
}

export default env;
