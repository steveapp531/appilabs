import { z } from 'zod';

const str = (max) => z.string().trim().max(max);
export const optStr = (max = 500) => str(max).optional().or(z.literal('').transform(() => undefined));

export const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(200);
export const name = str(120).min(2, 'Enter your name');
export const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s-]{6,30}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const attribution = z
  .object({
    utmSource: optStr(120),
    utmMedium: optStr(120),
    utmCampaign: optStr(160),
    utmTerm: optStr(160),
    utmContent: optStr(160),
    referrer: optStr(300),
    landingPage: optStr(300),
    referralCode: optStr(60),
  })
  .partial()
  .optional();

export const pillar = z.enum(['solutions', 'consulting', 'academy', 'general']);
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens').max(80);
export const honeypot = z.string().max(0).optional().or(z.string().transform(() => '__bot__'));
