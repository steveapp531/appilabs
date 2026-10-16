import env from '../config/env.js';
import { sendMail } from './email/index.js';
import { templates } from './email/templates.js';

export function notifyCustomer(to, template) {
  return sendMail({ to, ...template });
}

export function notifyAdmin(kind, summary) {
  if (!env.ADMIN_NOTIFY_EMAIL) return Promise.resolve({ skipped: true });
  return sendMail({ to: env.ADMIN_NOTIFY_EMAIL, ...templates.adminAlert(kind, summary) });
}
