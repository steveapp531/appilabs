import { useParams } from 'react-router-dom';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { Breadcrumbs, CtaBand, Skeleton, DemoTag } from '../components/blocks.jsx';
import { findCase, pillarByKey } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import NotFound from './NotFound.jsx';

export default function CaseStudyPage() {
  const { slug } = useParams();
  const { data: c, notFound } = useResource(`/case-studies/${slug}`, findCase(slug));
  if (notFound) return <NotFound />;
  if (!c) return <div className="container section"><Skeleton /></div>;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Work', path: '/work' }, { name: c.title, path: `/work/${c.slug}` }];
  return (
    <>
      <Seo title={c.title} description={c.summary} path={`/work/${c.slug}`} jsonLd={[breadcrumbJsonLd(crumbs)]} />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <div className={`page-hero--pillar k-${c.pillar}`}>
            <p className={`kicker k-${c.pillar}`}>{pillarByKey[c.pillar]?.name}. {c.sector}</p>
            <h1>{c.title}<DemoTag show={c.isDemo} label="Illustrative" /></h1>
            <p className="lede">{c.summary}</p>
          </div>
        </div>
      </section>
      <section className="section section--surface">
        <div className={`container stack k-${c.pillar}`} style={{ maxWidth: '52rem', marginLeft: 0 }}>
          {c.isDemo ? <p className="notice">This is an illustrative example of how we approach this kind of work. It does not describe a named client or report measured results.</p> : null}
          <h2>The challenge</h2><p>{c.challenge}</p>
          <h2>Approach</h2><ul className="checklist">{(c.approach || []).map((a) => <li key={a}>{a}</li>)}</ul>
          <h2>Deliverables</h2><ul className="checklist">{(c.deliverables || []).map((a) => <li key={a}>{a}</li>)}</ul>
          {c.result ? (<><h2>Result</h2><p>{c.result}</p></>) : null}
        </div>
      </section>
      <CtaBand title="Facing something similar?" />
    </>
  );
}
