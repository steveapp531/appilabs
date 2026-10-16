import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { useSettings } from '../lib/settings.jsx';

export const NAV = [
  { to: '/solutions', label: 'Solutions' },
  { to: '/consulting', label: 'Consulting' },
  { to: '/academy', label: 'Academy' },
  { to: '/work', label: 'Work' },
  { to: '/insights', label: 'Insights' },
  { to: '/about', label: 'About' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { announcement } = useSettings();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      {announcement ? <div className="announcement">{announcement}</div> : null}
      <header className="site-header">
        <div className="container site-header__inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.to}><NavLink to={n.to}>{n.label}</NavLink></li>
              ))}
            </ul>
          </nav>
          <div className="header-cta">
            <Link className="btn btn--ghost btn--sm" to="/book" data-cta="header_book">Book a call</Link>
            <Link className="btn btn--sm" to="/start" data-cta="header_start">Start a project</Link>
          </div>
          <button className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.to}><NavLink to={n.to}>{n.label}</NavLink></li>
              ))}
              <li><NavLink to="/contact">Contact</NavLink></li>
            </ul>
            <div className="actions">
              <Link className="btn" to="/start">Start a project</Link>
              <Link className="btn btn--ghost" to="/book">Book a call</Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
