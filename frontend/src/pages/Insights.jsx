import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { PageHero, PostList, Skeleton } from '../components/blocks.jsx';
import { posts } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';

export default function Insights() {
  const [query] = useSearchParams();
  // Query filters apply after hydration so the prerendered HTML (no filters) always matches the first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const params = mounted ? query : new URLSearchParams();
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const tag = params.get('tag') || '';
  const q = new URLSearchParams({ page: String(page), limit: '10', ...(tag ? { tag } : {}) }).toString();
  const fallback = page === 1 && !tag ? posts : undefined;
  const { data, meta, loading } = useResource(`/blog?${q}`, fallback);
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  return (
    <>
      <Seo title="Insights on software, data and research" description="Practical articles on business automation, software projects, data analytics, Power BI and research methodology." path="/insights" />
      <PageHero title="Insights" lede="Practical writing on building software, using data well and doing good research." />
      <section className="section section--surface">
        <div className="container">
          <nav aria-label="Topics" className="actions" style={{ marginBottom: 'var(--s-5)' }}>
            <Link className={`btn btn--sm ${tag ? 'btn--ghost' : ''}`} to="/insights">All</Link>
            {tags.map((t) => <Link key={t} className={`btn btn--sm ${tag === t ? '' : 'btn--ghost'}`} to={`/insights?tag=${encodeURIComponent(t)}`}>{t}</Link>)}
          </nav>
          {loading && !data ? <Skeleton /> : data?.length ? <PostList items={data} /> : <p>No articles in this topic yet. <Link to="/insights">See all insights</Link>.</p>}
          {meta?.pages > 1 ? (
            <nav className="actions" aria-label="Pagination" style={{ marginTop: 'var(--s-6)' }}>
              {page > 1 ? <Link className="btn btn--ghost btn--sm" to={`/insights?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}>Newer</Link> : null}
              <span className="muted">Page {page} of {meta.pages}</span>
              {page < meta.pages ? <Link className="btn btn--ghost btn--sm" to={`/insights?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}>Older</Link> : null}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
