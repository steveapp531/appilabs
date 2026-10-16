// DEMO provider. Simulates a successful payment so the full enrollment journey can be tested
// without credentials. Never use in production (the server warns if you do).
import env from '../../config/env.js';

export const name = 'mock';
const store = new Map();

export async function initialize({ amount, currency, reference }) {
  store.set(reference, { amount, currency });
  const url = new URL('/payment/callback', env.PUBLIC_SITE_URL);
  url.searchParams.set('reference', reference);
  url.searchParams.set('mock', '1');
  return { authorizationUrl: url.toString(), reference };
}

export async function verify(reference) {
  const tx = store.get(reference);
  // After a restart the in-memory store is empty; treat unknown references as pending.
  if (!tx) return { status: 'pending' };
  return { status: 'success', amount: tx.amount, currency: tx.currency, channel: 'mock', id: `mock_${reference}` };
}

export function verifyWebhook() {
  return false;
}
