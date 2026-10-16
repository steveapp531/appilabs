import { Link } from 'react-router-dom';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { PageHero, ServiceList, FaqList, CtaBand, Split, ProcessSteps } from '../components/blocks.jsx';
import { pillarByKey, servicesFor } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { process } from '@content';

/** Overview page for Solutions or Consulting. */
export default function Pillar({ pillarKey }) {
  const p = pillarByKey[pillarKey];
  const { data: items } = useResource(`/services?pillar=${pillarKey}`, servicesFor(pillarKey));
  return (
    <>
      <Seo
        title={`${p.name}: ${p.title}`}
        description={p.summary}
        path={p.path}
        jsonLd={[breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: p.name, path: p.path }]), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]}
      />
      <PageHero kicker={p.verb} pillar={p.key} title={p.title} lede={p.intro}>
        <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="btn" to={`/start?pillar=${p.key}`} data-cta={`${p.key}_hero_start`}>Discuss your project</Link>
          <Link className="btn btn--ghost" to="/book">Book a consultation</Link>
        </div>
      </PageHero>

      <Split id="outcomes" title="What changes" className="section--surface">
        <ul className="checklist" style={{ fontSize: 'var(--step-1)' }}>
          {p.outcomes.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </Split>

      <Split id="services" title="Services" intro={`${(items || []).length} services. Each one can be scoped on its own or combined.`}>
        <ServiceList items={(items || []).filter((s) => !s.track)} />
      </Split>

      <Split id="engage" title="Ways to work with us" className="section--surface">
        <dl className="engagements">
          {p.engagements.map((e) => <div key={e.name}><dt>{e.name}</dt><dd>{e.detail}</dd></div>)}
        </dl>
      </Split>

      <Split id="process" title="How it works">
        <ProcessSteps items={process} row={false} />
      </Split>

      <Split id="faq" title="Questions" className="section--surface">
        <FaqList items={p.faqs} />
      </Split>

      <CtaBand primary={{ to: `/start?pillar=${p.key}`, label: 'Start a project' }} />
    </>
  );
}
