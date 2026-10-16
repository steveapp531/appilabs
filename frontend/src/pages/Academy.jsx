import { Link } from 'react-router-dom';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { PageHero, CourseTable, ServiceList, FaqList, CtaBand, Split } from '../components/blocks.jsx';
import { pillarByKey, courses, researchServices } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';

export default function Academy() {
  const p = pillarByKey.academy;
  const { data: list } = useResource('/courses', courses);
  return (
    <>
      <Seo title="Academy: digital skills training and research support" description={p.summary} path="/academy" jsonLd={[breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Academy', path: '/academy' }])]} />
      <PageHero kicker={p.verb} pillar="academy" title={p.title} lede={p.intro} />

      <Split id="training" title="Professional training" intro="For individuals building a career in data, and for organisations upskilling their teams." className="section--surface">
        <CourseTable items={(list || []).slice(0, 5)} />
        <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="btn" to="/academy/courses">Browse all courses</Link>
          <Link className="btn btn--ghost" to="/academy/corporate-training">Training for your organisation</Link>
        </div>
      </Split>

      <Split id="research" title="Academic research support" intro="Structured guidance for undergraduate, master's and doctoral researchers.">
        <ServiceList items={researchServices.slice(0, 5)} showDeliverables={false} ctaLabel="Learn more" />
        <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="btn" to="/academy/research">All research services</Link>
          <Link className="btn btn--ghost" to="/academy/research/request">Request support</Link>
        </div>
      </Split>

      <Split id="faq" title="Questions" className="section--surface"><FaqList items={p.faqs} /></Split>
      <CtaBand title="Not sure which course fits?" text="Tell us your goals and current level. We will recommend a path." primary={{ to: '/start?pillar=academy', label: 'Ask for a recommendation' }} secondary={{ to: '/academy/courses', label: 'See courses' }} />
    </>
  );
}
