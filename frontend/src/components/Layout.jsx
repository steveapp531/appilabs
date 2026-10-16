import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { ConsentBanner } from './ConsentBanner.jsx';
import { captureAttribution } from '../lib/attribution.js';
import { track, onConsentChange } from '../lib/analytics.js';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    captureAttribution();
    // Delegated CTA click tracking: any element with data-cta="name".
    const onClick = (e) => {
      const el = e.target.closest?.('[data-cta]');
      if (el) track('cta_click', { cta: el.getAttribute('data-cta'), label: el.textContent.trim().slice(0, 60) });
    };
    document.addEventListener('click', onClick);
    const off = onConsentChange((c) => c.analytics && track('page_view'));
    return () => {
      document.removeEventListener('click', onClick);
      off();
    };
  }, []);

  useEffect(() => {
    track('page_view');
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}
