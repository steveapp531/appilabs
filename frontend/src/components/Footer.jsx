import { Link } from 'react-router-dom';
import { LogoMark } from './Logo.jsx';
import { NewsletterForm } from './NewsletterForm.jsx';
import { useSettings } from '../lib/settings.jsx';
import { openConsentSettings } from './ConsentBanner.jsx';

export function Footer() {
  const s = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo"><LogoMark /><span>AppiLabs</span></Link>
            <p>Software, data systems and skills for growing businesses. Research support for students and researchers.</p>
            <h2 id="footer-news">Practical notes, once a month</h2>
            <NewsletterForm source="footer" variant="inline" labelledBy="footer-news" />
          </div>
          <div>
            <h2>Solutions</h2>
            <ul>
              <li><Link to="/solutions/web-applications">Web applications</Link></li>
              <li><Link to="/solutions/mvp-development">MVPs</Link></li>
              <li><Link to="/solutions/process-automation">Automation</Link></li>
              <li><Link to="/solutions">All solutions</Link></li>
            </ul>
          </div>
          <div>
            <h2>Consulting</h2>
            <ul>
              <li><Link to="/consulting/fractional-cto">Fractional CTO</Link></li>
              <li><Link to="/consulting/business-intelligence">Business intelligence</Link></li>
              <li><Link to="/consulting/data-engineering">Data engineering</Link></li>
              <li><Link to="/consulting">All consulting</Link></li>
            </ul>
          </div>
          <div>
            <h2>Academy</h2>
            <ul>
              <li><Link to="/academy/courses">Courses</Link></li>
              <li><Link to="/academy/corporate-training">Corporate training</Link></li>
              <li><Link to="/academy/research">Research support</Link></li>
              <li><Link to="/resources">Free resources</Link></li>
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              <li><a href={`mailto:${s.email}`}>{s.email}</a></li>
              <li><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></li>
              {s.whatsapp ? <li><a href={`https://wa.me/${s.whatsapp}`} rel="noopener noreferrer">WhatsApp</a></li> : null}
              <li>{s.address}</li>
              <li><Link to="/contact">Contact form</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© {year} {s.businessName}. All rights reserved.</span>
          <span className="actions">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <button type="button" className="text-link" style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={openConsentSettings}>Privacy preferences</button>
          </span>
        </div>
      </div>
    </footer>
  );
}
