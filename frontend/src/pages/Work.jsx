import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { PageHero, CtaBand, DemoTag } from '../components/blocks.jsx';
import { caseStudies, pillarByKey } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';

export default function Work() {
  const { data } = useResource('/case-studies', caseStudies);
  const anyDemo = (data || []).some((c) => c.isDemo);
  return (
    <>
      <Seo title="Work and case studies" description="Examples of software, data and training projects delivered by AppiLabs." path="/work" />
      <PageHero title="Work" lede="How we approach real problems in software, data and training." />
      <section className="section section--surface">
        <div className="container">
          {anyDemo ? <p className="notice" style={{ marginBottom: 'var(--s-6)' }}>Items marked Illustrative describe typical engagements. They are examples of our approach, not reports of specific client results.</p> : null}
          <ul className="post-list">
            {(data || []).map((c) => (
              <li key={c.slug}>
                <span className={`kicker k-${c.pillar}`} style={{ margin: 0 }}>{pillarByKey[c.pillar]?.name}</span>
                <div>
                  <h3><Link to={`/work/${c.slug}`}>{c.title}</Link><DemoTag show={c.isDemo} label="Illustrative" /></h3>
                  <p>{c.sector}. {c.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
