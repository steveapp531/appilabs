import { Link } from 'react-router-dom';
import { priceLabel, money, date } from '../lib/format.js';
import { servicePath } from '../lib/content.js';
import { useSettings } from '../lib/settings.jsx';

export const DemoTag = ({ show, label = 'Sample' }) => (show ? <span className="tag" title="Illustrative content, replace before launch">{label}</span> : null);

export function PageHero({ kicker, pillar, title, lede, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className={pillar ? `page-hero--pillar k-${pillar}` : undefined}>
          {kicker ? <p className={`kicker ${pillar ? `k-${pillar}` : ''}`}>{kicker}</p> : null}
          <h1>{title}</h1>
          {lede ? <p className="lede">{lede}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={it.path}>{i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link to={it.path}>{it.name}</Link>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function Price({ pricing }) {
  const { showPrices } = useSettings();
  const p = showPrices ? priceLabel(pricing) : priceLabel({ model: 'quote' });
  return <div className="price">{p.main}{showPrices && pricing?.isDemoPrice && pricing?.amount ? <span className="tag" title="Placeholder price, confirm in the admin">Demo price</span> : null}<small>{p.note}</small></div>;
}

export function ServiceList({ items, showDeliverables = true, ctaLabel = 'View details' }) {
  return (
    <ul className="service-list">
      {items.map((s) => (
        <li key={s.slug} className="service-row">
          <div>
            <h3><Link to={servicePath(s)}>{s.title}</Link></h3>
            <p>{s.summary}</p>
          </div>
          {showDeliverables ? (
            <ul aria-label={`What you get with ${s.title}`}>
              {(s.deliverables || []).slice(0, 4).map((d) => <li key={d}>{d}</li>)}
            </ul>
          ) : <span />}
          <div className="service-row__meta">
            <Price pricing={s.pricing} />
            <Link className="text-link" to={servicePath(s)} aria-label={`${ctaLabel}: ${s.title}`}>{ctaLabel}</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CourseTable({ items }) {
  const { showPrices } = useSettings();
  return (
    <table className="course-table">
      <caption className="visually-hidden">Training courses</caption>
      <thead>
        <tr><th scope="col">Course</th><th scope="col">Level</th><th scope="col">Format</th><th scope="col">Duration</th><th scope="col">Fee</th></tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={c.slug}>
            <td><Link to={`/academy/courses/${c.slug}`}>{c.title}</Link><p>{c.summary}</p></td>
            <td data-label="Level">{c.level}</td>
            <td data-label="Format">{c.format}</td>
            <td data-label="Duration">{c.duration}</td>
            <td data-label="Fee" className="num">{showPrices && c.price ? money(c.price, c.currency) : 'On request'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PostList({ items }) {
  return (
    <ul className="post-list">
      {items.map((p) => (
        <li key={p.slug}>
          <time dateTime={new Date(p.publishedAt).toISOString()}>{date(p.publishedAt)}</time>
          <div>
            <h3><Link to={`/insights/${p.slug}`}>{p.title}</Link><DemoTag show={p.isDemo} /></h3>
            <p>{p.excerpt}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ items }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <div><p>{f.a}</p></div>
        </details>
      ))}
    </div>
  );
}

export function ProcessSteps({ items, row = true }) {
  return (
    <ol className={`steps ${row ? 'steps--row' : ''}`}>
      {items.map((s) => (
        <li key={s.title}><h3>{s.title}</h3><p>{s.detail}</p></li>
      ))}
    </ol>
  );
}

export function CtaBand({ title = 'Tell us what you are working on', text = 'A short discovery call is free. You leave with a clear next step, whether or not we work together.', primary = { to: '/start', label: 'Start a project' }, secondary = { to: '/book', label: 'Book a consultation' } }) {
  return (
    <section className="section section--dark">
      <div className="container cta-band">
        <div>
          <h2>{title}</h2>
          <p className="muted">{text}</p>
        </div>
        <div className="actions">
          <Link className="btn btn--signal" to={primary.to} data-cta={`band_${primary.to}`}>{primary.label}</Link>
          {secondary ? <Link className="btn btn--ghost" to={secondary.to}>{secondary.label}</Link> : null}
        </div>
      </div>
    </section>
  );
}

export function Split({ title, intro, children, sticky = false, id, className = '' }) {
  return (
    <section className={`section ${className}`} aria-labelledby={id}>
      <div className="container split">
        <div className={`split__head ${sticky ? 'split__head--sticky' : ''}`}>
          <h2 id={id}>{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
        <div className="split__body">{children}</div>
      </div>
    </section>
  );
}

export function Skeleton({ lines = 4 }) {
  return <div aria-busy="true" aria-label="Loading">{Array.from({ length: lines }, (_, i) => <div key={i} className="skeleton" style={{ width: `${90 - i * 12}%` }} />)}</div>;
}
