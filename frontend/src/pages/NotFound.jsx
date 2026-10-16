import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <section className="section section--flush status-page">
      <Seo title="Page not found" noindex />
      <div className="container">
        <p className="big-code" aria-hidden="true">404</p>
        <h1 style={{ fontSize: 'var(--step-4)' }}>This page does not exist</h1>
        <p className="lede">The link may be out of date, or the page has moved. These are good places to continue:</p>
        <div className="actions">
          <Link className="btn" to="/">Go to the homepage</Link>
          <Link className="btn btn--ghost" to="/solutions">Solutions</Link>
          <Link className="btn btn--ghost" to="/academy">Academy</Link>
          <Link className="text-link" to="/contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
