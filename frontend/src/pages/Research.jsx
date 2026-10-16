import { Link } from 'react-router-dom';
import { integrityPolicy, academicLevels } from '@content';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { PageHero, ServiceList, ProcessSteps, CtaBand, Split, Breadcrumbs, FaqList } from '../components/blocks.jsx';
import { researchServices } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';

const steps = [
  { title: 'Send your request', detail: 'Choose a service, tell us your level, topic and deadline, and attach any guidelines.' },
  { title: 'Get a plan and quote', detail: 'Within one working day we reply with how we will help, the sessions involved and a price.' },
  { title: 'Work together', detail: 'One-to-one sessions and written feedback, at the pace your deadline needs.' },
  { title: 'Submit with confidence', detail: 'You understand your work and can explain every decision in it.' },
];
const faqs = [
  { q: 'Will you write my dissertation or assignment?', a: 'No. We tutor, guide, review and help you analyse your own data. Requests to complete assessed work for submission are declined.' },
  { q: 'Can you help me with SPSS, R, Stata or NVivo?', a: 'Yes. We walk you through the analysis on your data and help you interpret and report the results correctly.' },
  { q: 'How quickly can you start?', a: 'Usually within two working days. Tell us your deadline so we can plan realistically.' },
  { q: 'Is my work kept confidential?', a: 'Yes. Uploaded files are private, visible only to the Academy team working with you, and deleted after 180 days or sooner on request.' },
];

export default function Research() {
  const { data } = useResource('/services?pillar=academy&track=research', researchServices);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Academy', path: '/academy' }, { name: 'Research support', path: '/academy/research' }];
  return (
    <>
      <Seo title="Academic research support and tutoring" description="Research proposal guidance, methodology, statistical analysis, literature review support, editing and defence preparation for undergraduate, master's and doctoral students." path="/academy/research" jsonLd={[breadcrumbJsonLd(crumbs)]} />
      <PageHero kicker="Academy" pillar="academy" title="Academic research support" lede={`Structured guidance for ${academicLevels.slice(0, 3).map((l) => l.label.toLowerCase()).join(', ')} and independent researchers, from your first idea to your final defence.`}>
        <Breadcrumbs items={crumbs} />
        <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="btn" to="/academy/research/request" data-cta="research_hero">Request support</Link>
          <Link className="btn btn--ghost" to="/resources">Free proposal template</Link>
        </div>
      </PageHero>
      <Split id="integrity" title="Our integrity commitment" intro="Support you can disclose to your supervisor." className="section--surface">
        <div className="notice integrity"><ul>{integrityPolicy.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </Split>
      <Split id="services" title="Services" intro="Pick one, or combine several for end to end guidance.">
        <ServiceList items={data || []} ctaLabel="Learn more" />
      </Split>
      <Split id="how" title="How it works" className="section--surface"><ProcessSteps items={steps} row={false} /></Split>
      <Split id="faq" title="Questions"><FaqList items={faqs} /></Split>
      <CtaBand title="Tell us where you are in your research" text="Three short steps. Attach your guidelines or draft if you have them." primary={{ to: '/academy/research/request', label: 'Request support' }} secondary={{ to: '/book', label: 'Book a coaching call' }} />
    </>
  );
}
