import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Seo, breadcrumbJsonLd, absolute } from '../components/Seo.jsx';
import { Breadcrumbs, CtaBand, Skeleton } from '../components/blocks.jsx';
import { findCourse } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { money } from '../lib/format.js';
import { track } from '../lib/analytics.js';
import { useSettings } from '../lib/settings.jsx';
import { site } from '@content';
import NotFound from './NotFound.jsx';

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showPrices } = useSettings();
  const { data: c, notFound } = useResource(`/courses/${slug}`, findCourse(slug));
  useEffect(() => { track('course_view', { course: slug }); }, [slug]);
  useEffect(() => { if (c?.slug && c.slug !== slug) navigate(`/academy/courses/${c.slug}`, { replace: true }); }, [c, slug, navigate]);
  if (notFound) return <NotFound />;
  if (!c) return <div className="container section"><Skeleton lines={6} /></div>;

  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Academy', path: '/academy' }, { name: 'Courses', path: '/academy/courses' }, { name: c.title, path: `/academy/courses/${c.slug}` }];
  const fee = showPrices && c.price ? money(c.price, c.currency) : 'On request';
  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.title,
    description: c.summary,
    url: absolute(`/academy/courses/${c.slug}`),
    provider: { '@type': 'Organization', name: site.name, sameAs: absolute('/') },
    ...(c.price ? { offers: { '@type': 'Offer', category: 'Paid', priceCurrency: c.currency, price: (c.price / 100).toFixed(2) } } : {}),
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: /online/i.test(c.format) ? 'Online' : 'Onsite', courseWorkload: c.duration },
  };

  return (
    <>
      <Seo title={c.seo?.title || `${c.title} course`} description={c.seo?.description || c.summary} path={`/academy/courses/${c.slug}`} jsonLd={[courseLd, breadcrumbJsonLd(crumbs)]} />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <div className="page-hero--pillar k-academy">
            <p className="kicker k-academy">{c.level}</p>
            <h1>{c.title}</h1>
            <p className="lede">{c.summary}</p>
          </div>
        </div>
      </section>
      <section className="section section--surface">
        <div className="container detail-grid k-academy">
          <div className="stack">
            {c.description ? <p>{c.description}</p> : null}
            <h2>You will be able to</h2>
            <ul className="checklist">{(c.outcomes || []).map((o) => <li key={o}>{o}</li>)}</ul>
            <h2>Course outline</h2>
            <ol className="modules">
              {(c.modules || []).map((m) => (
                <li key={m.title}><strong>{m.title}</strong><div className="muted">{m.topics.join(', ')}</div></li>
              ))}
            </ol>
            <h2>Before you start</h2>
            <ul className="checklist">{(c.prerequisites || []).map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
          <aside>
            <div className="aside-box" style={{ '--k': 'var(--academy)' }}>
              <h2>Course details</h2>
              <dl className="engagements" style={{ marginBottom: 'var(--s-5)' }}>
                <div><dt>Fee</dt><dd className="price">{fee}{c.isDemoPrice ? <span className="tag">Demo price</span> : null}</dd></div>
                <div><dt>Format</dt><dd>{c.format}</dd></div>
                <div><dt>Duration</dt><dd>{c.duration}</dd></div>
                <div><dt>Next cohort</dt><dd>{c.nextCohort || 'Announced on enquiry'}</dd></div>
              </dl>
              <div className="actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <Link className="btn" to={`/enroll/${c.slug}`} data-cta={`enroll_${c.slug}`}>Enroll</Link>
                <Link className="btn btn--ghost" to={`/academy/corporate-training?course=${c.slug}`}>Book for a team</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <CtaBand title="Questions about this course?" text="Ask about dates, payment plans or whether it suits your level." primary={{ to: `/enroll/${c.slug}`, label: 'Enroll' }} secondary={{ to: '/contact', label: 'Ask a question' }} />
    </>
  );
}
