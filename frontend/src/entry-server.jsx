import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { DataProvider } from './lib/data.jsx';
import { pillars, services, courses, posts, caseStudies } from '@content';

/** Renders a route. `collector` gathers the API paths the page requested so the build can fetch them. */
export function render(url, { initial = {}, collector = null } = {}) {
  const helmetContext = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <DataProvider initial={initial} collector={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </DataProvider>
    </HelmetProvider>,
  );
  const { helmet } = helmetContext;
  const head = [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script].map((h) => h.toString()).join('\n');
  return { html, head, htmlAttributes: helmet.htmlAttributes.toString() };
}

const servicePath = (s) => (s.track === 'research' ? `/academy/research/${s.slug}` : `/${s.pillar}/${s.slug}`);

/** Public routes to prerender. `extra` adds slugs published after the content snapshot (from the API). */
export function getRoutes(extra = {}) {
  const uniq = (arr) => [...new Set(arr)];
  const svc = [...services, ...(extra.services || [])];
  return uniq([
    '/', '/about', ...pillars.map((p) => p.path), '/academy/courses', '/academy/corporate-training', '/academy/research',
    '/academy/research/request', '/insights', '/work', '/contact', '/book', '/start', '/faq', '/privacy', '/terms', '/cookies', '/resources',
    ...svc.filter((s) => s.pillar !== 'academy' || s.track === 'research').map(servicePath),
    ...[...courses, ...(extra.courses || [])].map((c) => `/academy/courses/${c.slug}`),
    ...[...posts, ...(extra.posts || [])].map((p) => `/insights/${p.slug}`),
    ...[...caseStudies, ...(extra.caseStudies || [])].map((c) => `/work/${c.slug}`),
  ]);
}

// Not indexed but prerendered so they load instantly.
// Pages whose content depends on the query string (thank-you, payment callback, newsletter confirm)
// are not prerendered; they load through the SPA fallback (app.html) to avoid hydration mismatches.
export const utilityRoutes = ['/enroll', '/404'];
