import { Link } from 'react-router-dom';
import { site, principles } from '@content';
import { Seo, orgJsonLd } from '../components/Seo.jsx';
import { PageHero, Split, CtaBand } from '../components/blocks.jsx';
import { pillars } from '../lib/content.js';

export default function About() {
  const initials = site.founder.name.split(' ').map((n) => n[0]).join('');
  return (
    <>
      <Seo title="About AppiLabs" description="AppiLabs is a technology, data and training company based in Accra, Ghana." path="/about" jsonLd={[orgJsonLd()]} />
      <PageHero title="We build the structure behind growing organisations" lede="AppiLabs is a technology, data and training company based in Accra. We work with founders, SMEs, established organisations, professionals and researchers." />
      <Split id="what" title="What we do" className="section--surface">
        <dl className="engagements">
          {pillars.map((p) => <div key={p.key}><dt><Link to={p.path}>{p.name}</Link></dt><dd>{p.summary}</dd></div>)}
        </dl>
      </Split>
      <Split id="founder" title="Founder">
        <div className="founder">
          <div className="founder__mark" aria-hidden="true">{initials}</div>
          <div>
            <h3>{site.founder.name}</h3>
            {site.founder.bio.map((b) => <p key={b}>{b}</p>)}
          </div>
        </div>
      </Split>
      <Split id="how" title="How we work" className="section--surface">
        <div className="two-col">{principles.map((p) => <div key={p.title}><h3>{p.title}</h3><p className="muted">{p.detail}</p></div>)}</div>
      </Split>
      <Split id="where" title="Where we work">
        <p>We are based in {site.address} and work with clients in {site.serviceAreas.join(', ')}.</p>
      </Split>
      <CtaBand />
    </>
  );
}
