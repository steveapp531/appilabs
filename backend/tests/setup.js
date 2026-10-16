import { beforeAll, afterAll, inject } from 'vitest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.PAYMENT_PROVIDER = 'mock';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_unit_secret';
process.env.AUTOMATION_API_KEY = 'test-automation-key';
process.env.SETUP_TOKEN = 'test-setup-token';
process.env.STORAGE_LOCAL_DIR = 'storage/test-private';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.JWT_SECRET = 'x'.repeat(48);

beforeAll(async () => {
  const base = inject('mongoUri');
  const dbName = `appilabs_test_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  const url = new URL(base);
  url.pathname = `/${dbName}`;
  await mongoose.connect(url.toString());
  const { runMigrations } = await import('../src/migrations/runner.js');
  await runMigrations({ log: () => {} });
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase().catch(() => {});
  await mongoose.disconnect();
});
