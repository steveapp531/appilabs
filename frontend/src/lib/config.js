import { site } from '@content';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
export const SITE_URL = (import.meta.env.VITE_SITE_URL || site.url).replace(/\/$/, '');
export const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
export const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION || '';
