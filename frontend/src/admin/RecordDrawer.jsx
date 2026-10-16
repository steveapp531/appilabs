import { useEffect, useState } from 'react';
import { useAuth, can } from './auth.jsx';
import { RESOURCES, humanize } from './config.jsx';
import { dateTime, money } from '../lib/format.js';

const show = (k, v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.map((x) => (/^\d{4}-\d{2}-\d{2}T/.test(x) ? dateTime(x) : String(x))).join(', ');
  if (typeof v === 'object') return Object.entries(v).filter(([, x]) => x).map(([a, b]) => `${humanize(a)}: ${b}`).join(' | ') || null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return dateTime(v);
  if (['amount', 'quoteAmount'].includes(k)) return money(v);
  return String(v);
};

export function Drawer({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="drawer-backdrop" onClick={(e) => e.target === e.currentTarget && onClose(false)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="admin-head"><h2>{title}</h2><button className="btn btn--ghost btn--sm" onClick={() => onClose(false)}>Close</button></header>
        {children}
      </aside>
    </div>
  );
}

export function RecordDrawer({ resource, id, onClose }) {
  const cfg = RESOURCES[resource];
  const { call, user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    call('GET', `/admin/${resource}/${id}`).then((r) => {
      setDoc(r.data);
      setForm({ status: r.data.status, internalNotes: r.data.internalNotes || '', scheduledAt: r.data.scheduledAt?.slice(0, 16) || '', quoteAmount: r.data.quoteAmount ? r.data.quoteAmount / 100 : '' });
    }).catch((e) => setMsg(e.message));
  }, [call, resource, id]);

  const save = async () => {
    const body = { status: form.status };
    if (cfg.update?.notes) body.internalNotes = form.internalNotes;
    if (cfg.update?.scheduledAt && form.scheduledAt) body.scheduledAt = new Date(form.scheduledAt).toISOString();
    if (cfg.update?.quote && form.quoteAmount !== '') body.quoteAmount = Math.round(Number(form.quoteAmount) * 100);
    try {
      await call('PATCH', `/admin/${resource}/${id}`, body);
      onClose(true);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete this ${cfg.singular} and any attached files? This cannot be undone.`)) return;
    await call('DELETE', `/admin/${resource}/${id}`).then(() => onClose(true)).catch((e) => setMsg(e.message));
  };

  const download = async (file) => {
    const res = await call('GET', `/admin/files/${file._id}`, undefined, { raw: true });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await res.blob());
    a.download = file.originalName;
    a.click();
  };

  return (
    <Drawer title={doc ? doc.name || doc.email || doc.reference : 'Loading'} onClose={onClose}>
      {msg ? <div className="form-error" role="alert">{msg}</div> : null}
      {doc ? (
        <>
          <dl className="kv">
            {cfg.detail.map((k) => {
              const v = show(k, doc[k]);
              return v ? <div key={k}><dt>{humanize(k)}</dt><dd>{v}</dd></div> : null;
            })}
            <div><dt>Received</dt><dd>{dateTime(doc.createdAt)}</dd></div>
          </dl>
          {cfg.files && doc.files?.length ? (
            <section><h3>Files</h3><ul>{doc.files.map((f) => <li key={f._id}>{f.deletedAt ? `${f.originalName} (deleted)` : <button className="text-link" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => download(f)}>{f.originalName}</button>}</li>)}</ul></section>
          ) : null}
          {cfg.update ? (
            <section className="form" style={{ marginTop: '1.5rem' }}>
              <div className="field"><label htmlFor="st">Status</label>
                <select id="st" className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{cfg.update.statuses.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}</select>
              </div>
              {cfg.update.scheduledAt ? <div className="field"><label htmlFor="sa">Confirmed time</label><input id="sa" type="datetime-local" className="input" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></div> : null}
              {cfg.update.quote ? <div className="field"><label htmlFor="qa">Quote (GHS)</label><input id="qa" type="number" min="0" step="0.01" className="input" value={form.quoteAmount} onChange={(e) => setForm({ ...form, quoteAmount: e.target.value })} /></div> : null}
              {cfg.update.notes ? <div className="field"><label htmlFor="nt">Internal notes</label><textarea id="nt" className="textarea" rows={4} value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} /><p className="hint">Only visible to your team.</p></div> : null}
              <div className="actions">
                <button className="btn" onClick={save}>Save changes</button>
                {can(user, ['owner', 'admin']) ? <button className="btn btn--ghost" onClick={remove}>Delete</button> : null}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}
