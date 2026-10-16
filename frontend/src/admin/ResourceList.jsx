import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';
import { RESOURCES, humanize } from './config.jsx';
import { RecordDrawer } from './RecordDrawer.jsx';
import { ContentEditor } from './ContentEditor.jsx';
import { API_URL } from '../lib/config.js';

export default function ResourceList({ resource }) {
  const cfg = RESOURCES[resource];
  const { call } = useAuth();
  const [query, setQuery] = useState({ q: '', page: 1 });
  const [filters, setFilters] = useState({});
  const [result, setResult] = useState({ items: [], meta: null, loading: true, error: '' });
  const [open, setOpen] = useState(null); // id | 'new'

  const qs = new URLSearchParams({ page: String(query.page), limit: '20', ...(query.q ? { q: query.q } : {}), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }).toString();

  const load = useCallback(async () => {
    setResult((r) => ({ ...r, loading: true, error: '' }));
    try {
      const res = await call('GET', `/admin/${resource}?${qs}`);
      setResult({ items: res.data, meta: res.meta, loading: false, error: '' });
    } catch (err) {
      setResult({ items: [], meta: null, loading: false, error: err.message });
    }
  }, [call, resource, qs]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQuery({ q: '', page: 1 }); setFilters({}); setOpen(null); }, [resource]);

  const exportCsv = async () => {
    const res = await call('GET', `/admin/${resource}?${qs}&format=csv`, undefined, { raw: true });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${resource}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <header className="admin-head">
        <h1>{cfg.title}</h1>
        <div className="actions">
          {cfg.csv ? <button className="btn btn--ghost btn--sm" onClick={exportCsv}>Export CSV</button> : null}
          {cfg.content ? <button className="btn btn--sm" onClick={() => setOpen('new')}>New {cfg.singular}</button> : null}
        </div>
      </header>
      <form className="admin-toolbar" role="search" onSubmit={(e) => { e.preventDefault(); setQuery((q) => ({ ...q, page: 1, q: new FormData(e.currentTarget).get('q') })); }}>
        <label className="visually-hidden" htmlFor="q">Search</label>
        <input id="q" name="q" className="input" placeholder={`Search ${cfg.title.toLowerCase()}`} defaultValue={query.q} key={resource} />
        {cfg.filters?.map((f) => (
          <select key={f.key} className="select" aria-label={f.label} value={filters[f.key] || ''} onChange={(e) => { setFilters((s) => ({ ...s, [f.key]: e.target.value })); setQuery((q) => ({ ...q, page: 1 })); }}>
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => <option key={o} value={o}>{humanize(o)}</option>)}
          </select>
        ))}
        <button className="btn btn--sm">Search</button>
      </form>
      {result.error ? <div className="form-error" role="alert">{result.error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>{cfg.columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr></thead>
          <tbody>
            {result.items.map((row) => (
              <tr key={row._id} onClick={() => setOpen(row._id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(row._id)}>
                {cfg.columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : c.badge ? <span className={`badge badge--${row[c.key]}`}>{humanize(String(row[c.key] ?? ''))}</span> : String(row[c.key] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!result.loading && !result.items.length ? (
          <div className="admin-empty">
            <p><strong>Nothing here yet.</strong></p>
            <p className="muted">{query.q || Object.values(filters).some(Boolean) ? 'No records match these filters. Clear the search to see everything.' : cfg.content ? `Create the first ${cfg.singular} to publish it on the site.` : 'New submissions from the website appear here automatically.'}</p>
          </div>
        ) : null}
        {result.loading ? <p className="muted" style={{ padding: '1rem' }}>Loading</p> : null}
      </div>
      {result.meta && result.meta.pages > 1 ? (
        <nav className="actions admin-pager" aria-label="Pagination">
          <button className="btn btn--ghost btn--sm" disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}>Previous</button>
          <span className="muted">Page {result.meta.page} of {result.meta.pages}, {result.meta.total} records</span>
          <button className="btn btn--ghost btn--sm" disabled={query.page >= result.meta.pages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}>Next</button>
        </nav>
      ) : result.meta ? <p className="muted admin-pager">{result.meta.total} records</p> : null}

      {open && cfg.content ? <ContentEditor resource={resource} id={open === 'new' ? null : open} onClose={(changed) => { setOpen(null); if (changed) load(); }} /> : null}
      {open && !cfg.content ? <RecordDrawer resource={resource} id={open} apiUrl={API_URL} onClose={(changed) => { setOpen(null); if (changed) load(); }} /> : null}
    </div>
  );
}
