import env from '../../config/env.js';
import * as paystack from './paystack.js';
import * as mock from './mock.js';

// Provider interface: { name, initialize({ email, amount, currency, reference, callbackUrl, metadata }),
//                       verify(reference) -> { status: 'success'|'failed'|'abandoned'|'pending', amount, currency, channel, id },
//                       verifyWebhook(rawBody, headers) -> boolean }
export function getPaymentProvider() {
  if (env.PAYMENT_PROVIDER === 'paystack') return paystack;
  if (env.PAYMENT_PROVIDER === 'mock') return mock;
  return null;
}
