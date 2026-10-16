import { createApp } from './app.js';
import { connectDb, isDbReady } from './config/db.js';
import logger from './lib/logger.js';
import { runMigrations } from './migrations/runner.js';

let connectionPromise;
let migrationsPromise;

async function initializeDatabase() {
  if (!isDbReady()) {
    connectionPromise ??= connectDb().finally(() => {
      connectionPromise = undefined;
    });
    await connectionPromise;
  }
  migrationsPromise ??= runMigrations({ log: (message) => logger.info(message) }).catch((error) => {
    migrationsPromise = undefined;
    throw error;
  });
  await migrationsPromise;
}

function beforeApiRoutes(_req, _res, next) {
  initializeDatabase().then(
    () => next(),
    (error) => {
      if (_req.path === '/api/v1/ready') {
        logger.error({ err: error.message }, 'Database initialization failed during readiness check');
        return next();
      }
      return next(error);
    },
  );
}

export default createApp({ beforeApiRoutes });
