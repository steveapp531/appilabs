import env from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { createApp } from './app.js';
import logger from './lib/logger.js';
import { purgeExpiredUploads } from './services/uploads.js';
import { runMigrations } from './migrations/runner.js';

const app = createApp();
let server;

async function start() {
  try {
    await connectDb();
    await runMigrations({ log: (m) => logger.info(m) });
  } catch (err) {
    // Start anyway so /health responds and /ready reports the database problem clearly.
    logger.error({ err: err.message }, 'MongoDB connection failed. Check MONGODB_URI. Retrying in the background.');
    setTimeout(start, 15000).unref();
    if (server) return;
  }
  if (server) return;
  server = app.listen(env.PORT, () => logger.info(`AppiLabs API listening on :${env.PORT} (docs at /api/docs)`));

  // Daily retention job for uploaded documents.
  setInterval(() => purgeExpiredUploads().then((n) => n && logger.info({ n }, 'Purged expired uploads')).catch(() => {}), 24 * 3600000).unref();
}

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server?.close(async () => {
    await disconnectDb().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => logger.error({ err }, 'Unhandled rejection'));

start();
