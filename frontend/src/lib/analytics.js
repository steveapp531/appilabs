import { GA_ID } from './config.js';
import { api } from './api.js';
import { getAttribution } from './attribution.js';

const CONSENT_KEY = 'apl_consent';
const listeners = new Set();

export function getConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setConsent(analytics) {
  const value = { analytics: Boolean(analytics), decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  if (analytics) loadGa();
  listeners.forEach((fn) => fn(value));
  return value;
}

export const onConsentChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

let gaLoaded = false;
export function loadGa() {
  if (gaLoaded || !GA_ID || typeof window === 'undefined') return;
  gaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
}

function sessionId() {
  try {
    let id = sessionStorage.getItem('apl_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem('apl_sid', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Tracks an event in GA4 and first-party analytics, only if the visitor accepted analytics. */
export function track(name, props = {}) {
  if (typeof window === 'undefined' || !getConsent()?.analytics) return;
  const path = window.location.pathname;
  window.gtag?.('event', name, { ...props, page_path: path });
  api.post('/events', { name, path, props, sessionId: sessionId(), attribution: getAttribution() }).catch(() => {});
}
