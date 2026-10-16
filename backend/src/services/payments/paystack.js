import crypto from 'node:crypto';
import env from '../../config/env.js';
import { ApiError } from '../../lib/http.js';

export const name = 'paystack';
const BASE = 'https://api.paystack.co';

async function call(path, init = {}) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) {
    throw new ApiError(502, 'payment_provider_error', body.message || 'Payment provider error');
  }
  return body.data;
}

export async function initialize({ email, amount, currency, reference, callbackUrl, metadata }) {
  const data = await call('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({ email, amount, currency, reference, callback_url: callbackUrl, metadata }),
  });
  return { authorizationUrl: data.authorization_url, reference: data.reference };
}

export async function verify(reference) {
  const data = await call(`/transaction/verify/${encodeURIComponent(reference)}`);
  return { status: data.status, amount: data.amount, currency: data.currency, channel: data.channel, id: String(data.id) };
}

export function verifyWebhook(rawBody, headers) {
  const signature = headers['x-paystack-signature'];
  if (!signature || !rawBody) return false;
  const hash = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  return hash.length === signature.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
