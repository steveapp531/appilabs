// Static site generation for SEO.
// 1. Renders every public route with the server bundle.
// 2. Fetches the API data each page asked for (when VITE_API_URL is reachable) and renders again with it.
// 3. Writes dist/<route>/index.html, sitemap.xml and robots.txt.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const API = (process.env.VITE_API_URL || '').replace(/\/$/, '');
const SITE = (process.env.VITE_SITE_URL || 'https://appilabs.com').replace(/\/$/, '');

const { render, getRoutes, utilityRoutes } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');

async function fetchJson(p) {
  if (!API) return undefined;
  try {
    const res = await fetch(`${API}/api/v1${p}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    return (await res.json()).data;
  } catch {
    return undefined;
  }
}

const apiUp = API ? Boolean(await fetchJson('/health').catch(() => null)) || Boolean(await fetchJson('/sitemap-entries')) : false;
const extra = apiUp ? (await fetchJson('/sitemap-entries')) || {} : {};
console.log(apiUp ? `Prerender: using live data from ${API}` : 'Prerender: API not reachable, using bundled content snapshot');

const routes = getRoutes(extra);
const safeJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');

async function renderRoute(url) {
  let initial = {};
  if (apiUp) {
    const collector = new Set();
    render(url, { collector });
    const entries = await Promise.all([...collector].map(async (p) => [p, await fetchJson(p)]));
    initial = Object.fromEntries(entries.filter(([, v]) => v !== undefined));
  }
  const { html, head, htmlAttributes } = render(url, { initial });
  return template
    .replace('<html lang="en-GB">', `<html ${htmlAttributes || 'lang="en-GB"'}>`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html)
    .replace('<!--app-data-->', Object.keys(initial).length ? `<script>window.__APL_DATA__=${safeJson(initial)}</script>` : '');
}

for (const url of [...routes, ...utilityRoutes]) {
  const out = await renderRoute(url);
  // Vercel cleanUrls serves /about from about.html (see vercel.json and scripts/serve.mjs).
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, `${url.slice(1)}.html`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, out);
}

// The unrendered template stays available as the SPA fallback for admin and new routes.
await fs.writeFile(path.join(dist, 'app.html'), template.replace('<!--app-head-->', '<title>AppiLabs</title><meta name="robots" content="noindex">').replace('<!--app-html-->', '').replace('<!--app-data-->', ''));

const today = new Date().toISOString().slice(0, 10);
const priority = (u) => (u === '/' ? '1.0' : u.split('/').length === 2 ? '0.8' : '0.6');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.filter((u) => u !== '/academy/research/request').map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${today}</lastmod><priority>${priority(u)}</priority></url>`).join('\n')}
</urlset>
`;
await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /thank-you\nDisallow: /payment\nDisallow: /enroll\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Prerendered ${routes.length + utilityRoutes.length} pages, wrote sitemap.xml (${routes.length - 1} URLs) and robots.txt`);
