import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent, loadGa } from '../lib/analytics.js';

const OPEN_EVENT = 'apl:consent-open';
export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = getConsent();
    if (!current) setVisible(true);
    else if (current.analytics) loadGa();
    const open = () => setVisible(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (!visible) return null;
  const choose = (analytics) => {
    setConsent(analytics);
    setVisible(false);
  };
  return (
    <section className="consent" role="dialog" aria-labelledby="consent-title" aria-live="polite">
      <h2 id="consent-title" style={{ fontSize: 'var(--step-1)' }}>Analytics preferences</h2>
      <p>We use optional analytics to see which pages are useful. Nothing is shared for advertising. Read the <Link to="/cookies">cookie notice</Link>.</p>
      <div className="actions">
        <button className="btn btn--sm" onClick={() => choose(true)}>Allow analytics</button>
        <button className="btn btn--ghost btn--sm" onClick={() => choose(false)}>Necessary only</button>
      </div>
    </section>
  );
}
