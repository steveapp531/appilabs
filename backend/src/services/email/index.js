import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import env from '../../config/env.js';
import logger from '../../lib/logger.js';

// Drivers:
//   log  -> writes each email to storage/outbox/*.json and logs a summary (default, no credentials needed)
//   smtp -> sends via SMTP (any provider: Zoho, Google Workspace, Brevo, Resend SMTP, Mailgun, SES)
//   none -> discards (used in tests)
let transporter;
function getTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  if (!to) return { skipped: true };
  const driver = env.isTest ? 'none' : env.EMAIL_DRIVER;
  try {
    if (driver === 'smtp') {
      if (!env.SMTP_HOST) throw new Error('SMTP_HOST is not configured');
      const info = await getTransport().sendMail({ from: env.EMAIL_FROM, to, subject, text, html, replyTo });
      return { sent: true, id: info.messageId };
    }
    if (driver === 'log') {
      const dir = path.resolve('storage/outbox');
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `${Date.now()}-${subject.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.json`);
      await fs.writeFile(file, JSON.stringify({ from: env.EMAIL_FROM, to, subject, text }, null, 2));
      logger.info({ to, subject }, 'Email written to outbox (EMAIL_DRIVER=log)');
      return { logged: true, file };
    }
    return { skipped: true };
  } catch (err) {
    // Email failure must never break a form submission. Log and continue.
    logger.error({ err: err.message, subject }, 'Email delivery failed');
    return { error: err.message };
  }
}
