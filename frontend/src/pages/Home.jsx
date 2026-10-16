import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site, process, faqs } from '@content';
import { Seo, orgJsonLd } from '../components/Seo.jsx';
import { StructureDiagram } from '../components/StructureDiagram.jsx';
import { CtaBand, DemoTag, FaqList, Split } from '../components/blocks.jsx';
import { findService, posts, caseStudies, servicePath } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { SITE_URL } from '../lib/config.js';

const featured = [
  { slug: 'process-automation', label: 'Automate a process' },
  { slug: 'web-applications', label: 'Build a web app' },
  { slug: 'business-intelligence', label: 'Make data useful' },
  { slug: 'fractional-cto', label: 'Get tech leadership' },
]
  .map((option) => ({ ...option, service: findService(option.slug) }))
  .filter((option) => option.service);

const approach = [
  { title: 'Start with the real work', detail: 'We understand your workflow before choosing a tool or writing code.' },
  { title: 'Keep it simple', detail: 'We solve the need without adding complexity your team does not need.' },
  { title: 'Show what changed', detail: 'We agree on success measures, then make progress visible.' },
  { title: 'Hand over with care', detail: 'You get the documentation and guidance to keep moving independently.' },
];

export default function Home() {
  const [activeService, setActiveService] = useState(featured[0]?.slug);
  const [activeStep, setActiveStep] = useState(0);
  const blog = useResource('/blog?limit=3', posts.slice(0, 3));
  const cases = useResource('/case-studies', caseStudies);
  const selectedService = featured.find((option) => option.slug === activeService) || featured[0];
  const insights = (blog.data || [])
    .filter((post) => !/(academy|research)/i.test([post.title, ...(post.tags || [])].join(' ')))
    .slice(0, 2);
  const selectedCase = (cases.data || []).find((caseStudy) => caseStudy.pillar !== 'academy');

  return (
    <div className="home-page">
      <Seo
        title="Software, automation and technology consulting"
        path="/"
        description="AppiLabs builds practical software and data systems, and provides technology and data consulting. Based in Accra, Ghana, working across Africa and remotely."
        jsonLd={[orgJsonLd(), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: SITE_URL }]}
      />

      <section className="hero">
        <div className="container hero__grid">
          <div>
            <h1>Vision requires structure to scale.</h1>
            <p className="lede">
              We build practical software and data systems that help your business run reliably, so your team can spend less
              time chasing work and more time moving forward.
            </p>
            <div className="actions">
              <Link className="btn" to="/start" data-cta="hero_start">Start a project</Link>
              <a className="btn btn--ghost" href="#services">Explore services</a>
            </div>
            <p className="hero__note">Based in Accra. Working with teams across Africa and remotely.</p>
          </div>
          <StructureDiagram />
        </div>
      </section>

      <section className="section section--dark home-problem" aria-labelledby="problem-title">
        <div className="container">
          <h2 id="problem-title" className="problem">Growth gets harder when:</h2>
          <ul className="home-problem__list">
            <li>Reports are scattered across spreadsheets</li>
            <li>Repetitive work still depends on people</li>
            <li>Your tools do not work together</li>
          </ul>
        </div>
      </section>

      <section className="section section--surface home-section" id="services" aria-labelledby="services-title">
        <div className="container">
          <div className="home-section__intro">
            <p className="kicker">Find your starting point</p>
            <h2 id="services-title">What would you like to work better?</h2>
            <p>Choose the challenge that sounds familiar. We’ll show you a practical next step.</p>
          </div>
          <div className="service-picker">
            <div className="service-picker__choices" role="group" aria-label="Choose a business challenge">
              {featured.map(({ slug, label }) => (
                <button
                  key={slug}
                  className="service-picker__choice"
                  type="button"
                  aria-pressed={activeService === slug}
                  onClick={() => setActiveService(slug)}
                >
                  {label}<span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            {selectedService ? (
              <div className="service-picker__detail" aria-live="polite">
                <div>
                  <p className={`kicker k-${selectedService.service.pillar}`}>{selectedService.service.pillar === 'solutions' ? 'We build' : 'We advise'}</p>
                  <h3>{selectedService.service.title}</h3>
                  <p>{selectedService.service.summary}</p>
                </div>
                <div className="service-picker__actions">
                  <Link className="text-link" to={servicePath(selectedService.service)}>Explore this service</Link>
                  <Link className="btn btn--sm" to="/start" data-cta="service_start">Talk through your project</Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Split
        id="process-title"
        title="A clear path forward"
        intro="From first conversation to confident handover."
        className="home-section"
      >
        <div className="home-process">
          <div className="home-process__steps" role="group" aria-label="How we work">
            {process.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className="home-process__step"
                aria-label={`Step ${index + 1}: ${step.title}`}
                aria-pressed={activeStep === index}
                aria-controls="home-process-detail"
                onClick={() => setActiveStep(index)}
              >
                <span className="home-process__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="home-process__title">{step.title}</span>
              </button>
            ))}
          </div>
          <div className="home-process__detail" id="home-process-detail" aria-live="polite">
            <span>{String(activeStep + 1).padStart(2, '0')} <span aria-hidden="true">/</span> {String(process.length).padStart(2, '0')}</span>
            <p>{process[activeStep]?.detail}</p>
          </div>
        </div>
      </Split>

      {selectedCase ? (
        <section className="section home-section home-work" aria-labelledby="work-title">
          <div className="container">
            <div className="home-section__intro">
              <p className="kicker">A glimpse of what we solve</p>
              <h2 id="work-title">Work that moves things forward.</h2>
            </div>
            <article className="home-work__card">
              <div className="home-work__meta">
                <span className={`kicker k-${selectedCase.pillar}`}>{selectedCase.sector}</span>
                <DemoTag show={selectedCase.isDemo} label="Illustrative example" />
              </div>
              <div>
                <h3><Link to={`/work/${selectedCase.slug}`}>{selectedCase.title}</Link></h3>
                <p>{selectedCase.summary}</p>
              </div>
              <Link className="text-link" to="/work">Explore selected work</Link>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section section--surface home-section" aria-labelledby="approach-title">
        <div className="container">
          <div className="home-section__intro">
            <p className="kicker">A better way to build</p>
            <h2 id="approach-title">Thoughtful work. No unnecessary complexity.</h2>
          </div>
          <div className="home-approach">
            {approach.map((principle, index) => (
              <article className="home-approach__item" key={principle.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{principle.title}</h3>
                <p>{principle.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {insights.length ? (
        <section className="section home-section" aria-labelledby="insights-title">
          <div className="container">
            <div className="home-insights__heading">
              <div>
                <p className="kicker">Ideas you can put to work</p>
                <h2 id="insights-title">A little insight. A useful next step.</h2>
              </div>
              <Link className="text-link" to="/insights">All insights</Link>
            </div>
            <div className="home-insights">
              {insights.map((post) => (
                <article className="home-insights__card" key={post.slug}>
                  <p className="home-insights__tag">{(post.tags || []).slice(0, 2).join(' · ')}</p>
                  <h3><Link to={`/insights/${post.slug}`}>{post.title}</Link></h3>
                  <p className="home-insights__meta">{post.readingMinutes} min read <DemoTag show={post.isDemo} /></p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Split
        id="faq-title"
        title="A few quick answers"
        className="home-section"
      >
        <FaqList items={faqs.slice(0, 2)} />
        <p className="home-faq__more"><Link className="text-link" to="/faq">More answers</Link></p>
      </Split>

      <CtaBand />
    </div>
  );
}
