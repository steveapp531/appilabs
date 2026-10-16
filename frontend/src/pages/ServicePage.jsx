import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { integrityPolicy } from '@content';
import { Seo, breadcrumbJsonLd, absolute } from '../components/Seo.jsx';
import { Breadcrumbs, Price, ServiceList, FaqList, CtaBand, Skeleton } from '../components/blocks.jsx';
import { findService, pillarByKey, servicesFor, servicePath } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { track } from '../lib/analytics.js';
import NotFound from './NotFound.jsx';

export default function ServicePage({ pillarKey, track: trackName = null }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: s, loading, notFound } = useResource(`/services/${slug}`, findService(slug));

  useEffect(() => {
    if (s?.slug && s.slug !== slug) navigate(servicePath(s), { replace: true }); // renamed slug
  }, [s, slug, navigate]);
  useEffect(() => {
    track('service_view', { service: slug, pillar: pillarKey });
  }, [slug, pillarKey]);

  if (notFound || (s && (s.pillar !== pillarKey || (s.track ?? null) !== trackName))) return <NotFound />;
  if (!s) return <div className="container section"><Skeleton lines={6} /></div>;

  const p = pillarByKey[s.pillar];
  const isResearch = s.track === 'research';
  const base = isResearch ? { name: 'Research support', path: '/academy/research' } : { name: p.name, path: p.path };
  const crumbs = [{ name: 'Home', path: '/' }, ...(isResearch ? [{ name: 'Academy', path: '/academy' }] : []), base, { name: s.title, path: servicePath(s) }];
  const related = servicesFor(s.pillar, trackName).filter((x) => x.slug !== s.slug).slice(0, 3);
  const startHref = isResearch ? `/academy/research/request?service=${s.slug}` : `/start?pillar=${s.pillar}&service=${s.slug}`;

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.summary,
    url: absolute(servicePath(s)),
    provider: { '@id': `${absolute('/')}#org` },
    areaServed: 'GH',
    ...(s.pricing?.amount ? { offers: { '@type': 'Offer', priceCurrency: s.pricing.currency || 'GHS', price: (s.pricing.amount / 100).toFixed(2) } } : {}),
  };

  return (
    <>
      <Seo title={s.seo?.title || s.title} description={s.seo?.description || s.summary} path={servicePath(s)} jsonLd={[serviceLd, breadcrumbJsonLd(crumbs)]} />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <div className={`page-hero--pillar k-${s.pillar}`}>
            <p className={`kicker k-${s.pillar}`}>{isResearch ? 'Academic research support' : p.verb}</p>
            <h1>{s.title}</h1>
            <p className="lede">{s.summary}</p>
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className={`container detail-grid k-${s.pillar}`}>
          <div className="stack">
            {s.outcome ? <p className="lede" style={{ fontWeight: 500 }}>{s.outcome}</p> : null}
            {s.description ? <p>{s.description}</p> : null}
            <h2>What you get</h2>
            <ul className="checklist">{(s.deliverables || []).map((d) => <li key={d}>{d}</li>)}</ul>
            <h2>A good fit when</h2>
            <ul className="checklist">{(s.useCases || []).map((d) => <li key={d}>{d}</li>)}</ul>
            {isResearch ? (
              <div className="notice integrity">
                <h3>How we keep it ethical</h3>
                <ul>{integrityPolicy.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ) : (
              <>
                <h2>Ways to engage</h2>
                <dl className="engagements">{p.engagements.map((e) => <div key={e.name}><dt>{e.name}</dt><dd>{e.detail}</dd></div>)}</dl>
              </>
            )}
            {loading ? <p className="hint">Checking for the latest details</p> : null}
          </div>
          <aside>
            <div className="aside-box" style={{ '--k': `var(--${s.pillar})` }}>
              <h2>{isResearch ? 'Get support' : 'Start here'}</h2>
              <Price pricing={s.pricing} />
              <p className="hint" style={{ margin: 'var(--s-4) 0' }}>
                {isResearch ? 'Tell us your level, topic and deadline. We reply with a plan and quote within one working day.' : 'Three short steps. We reply within one working day with questions or a proposal outline.'}
              </p>
              <div className="actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <Link className="btn" to={startHref} data-cta={`service_${s.slug}`}>{isResearch ? 'Request support' : 'Discuss this service'}</Link>
                <Link className="btn btn--ghost" to="/book">Book a consultation</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section">
          <div className="container">
            <h2>Related services</h2>
            <ServiceList items={related} showDeliverables={false} />
          </div>
        </section>
      ) : null}

      <section className="section section--surface">
        <div className="container split">
          <div className="split__head"><h2>Questions</h2></div>
          <div className="split__body"><FaqList items={pillarByKey[s.pillar].faqs} /></div>
        </div>
      </section>
      <CtaBand primary={{ to: startHref, label: isResearch ? 'Request support' : 'Start a project' }} />
    </>
  );
}
