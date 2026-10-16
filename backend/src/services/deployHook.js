import env from '../config/env.js';
import logger from '../lib/logger.js';

// Triggers a Vercel rebuild so prerendered pages pick up newly published content.
let timer;
export function scheduleRebuild() {
  if (!env.VERCEL_DEPLOY_HOOK_URL || env.isTest) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await fetch(env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
      logger.info('Vercel deploy hook triggered');
    } catch (err) {
      logger.warn({ err: err.message }, 'Vercel deploy hook failed');
    }
  }, 30000); // debounce bursts of edits
  timer.unref?.();
}
