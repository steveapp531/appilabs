import { Link } from 'react-router-dom';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { PageHero, CourseTable, CtaBand, Breadcrumbs } from '../components/blocks.jsx';
import { courses } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';

export default function Courses() {
  const { data } = useResource('/courses', courses);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Academy', path: '/academy' }, { name: 'Courses', path: '/academy/courses' }];
  return (
    <>
      <Seo title="Data analytics and digital skills courses" description="Courses in business data analytics, Excel, SQL, Power BI, Python, data visualisation and business automation. Live online and in Accra." path="/academy/courses" jsonLd={[breadcrumbJsonLd(crumbs)]} />
      <PageHero kicker="Professional training" pillar="academy" title="Courses" lede="Practical, project based courses taught live by practitioners. Every course ends with a piece of work you can use or show.">
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <section className="section section--surface">
        <div className="container">
          <CourseTable items={data || []} />
          <p className="hint" style={{ marginTop: 'var(--s-5)' }}>Fees are per person in Ghana cedis. Group and corporate rates are available on <Link to="/academy/corporate-training">corporate training</Link>.</p>
        </div>
      </section>
      <CtaBand title="Training a team?" text="We tailor any course to your tools and data, on site or online." primary={{ to: '/academy/corporate-training', label: 'Corporate training' }} secondary={{ to: '/contact', label: 'Ask a question' }} />
    </>
  );
}
