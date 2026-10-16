import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Seo, breadcrumbJsonLd, absolute } from '../components/Seo.jsx';
import { Breadcrumbs, CtaBand, Skeleton, DemoTag } from '../components/blocks.jsx';
import { NewsletterForm } from '../components/NewsletterForm.jsx';
import { Markdown } from '../lib/markdown.jsx';
import { findPost } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { date } from '../lib/format.js';
import { site } from '@content';
import NotFound from './NotFound.jsx';

export default function Article() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: p, notFound } = useResource(`/blog/${slug}`, findPost(slug));
  useEffect(() => { if (p?.slug && p.slug !== slug) navigate(`/insights/${p.slug}`, { replace: true }); }, [p, slug, navigate]);
  if (notFound) return <NotFound />;
  if (!p) return <div className="container section"><Skeleton lines={8} /></div>;
  const path = `/insights/${p.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }, { name: p.title, path }];
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.excerpt, datePublished: new Date(p.publishedAt).toISOString(), dateModified: new Date(p.updatedAt || p.publishedAt).toISOString(), author: { '@type': 'Organization', name: p.author || site.name }, publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: absolute('/favicon.svg') } }, mainEntityOfPage: absolute(path) };
  return (
    <>
      <Seo title={p.seo?.title || p.title} description={p.seo?.description || p.excerpt} path={path} type="article" jsonLd={[ld, breadcrumbJsonLd(crumbs)]} />
      <article>
        <header className="page-hero">
          <div className="container">
            <Breadcrumbs items={crumbs} />
            <h1>{p.title}</h1>
            <div className="meta-line">
              <time dateTime={new Date(p.publishedAt).toISOString()}>{date(p.publishedAt)}</time>
              {p.readingMinutes ? <span>{p.readingMinutes} minute read</span> : null}
              {(p.tags || []).map((t) => <Link key={t} to={`/insights?tag=${encodeURIComponent(t)}`}>{t}</Link>)}
              <DemoTag show={p.isDemo} label="Sample article" />
            </div>
            <p className="lede">{p.excerpt}</p>
          </div>
        </header>
        <section className="section section--surface">
          <div className="container prose"><Markdown source={p.body} /></div>
        </section>
      </article>
      <section className="section">
        <div className="container split">
          <div className="split__head"><h2 id="art-news">Get the next one by email</h2></div>
          <div className="split__body"><NewsletterForm source={`article_${p.slug}`} labelledBy="art-news" /></div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
