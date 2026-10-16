// First-touch attribution for the current browser session. Stored in sessionStorage only.
const KEY = 'apl_attr';
const PARAMS = { utm_source: 'utmSource', utm_medium: 'utmMedium', utm_campaign: 'utmCampaign', utm_term: 'utmTerm', utm_content: 'utmContent', ref: 'referralCode' };

export function captureAttribution(loc = window.location, referrer = document.referrer) {
  try {
    if (sessionStorage.getItem(KEY)) return getAttribution();
    const params = new URLSearchParams(loc.search);
    const data = {};
    for (const [param, key] of Object.entries(PARAMS)) {
      const v = params.get(param);
      if (v) data[key] = v.slice(0, 150);
    }
    if (referrer && !referrer.startsWith(loc.origin)) data.referrer = referrer.slice(0, 300);
    data.landingPage = loc.pathname.slice(0, 300);
    sessionStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
}

export function getAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
