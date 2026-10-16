import { useEffect, useState } from 'react';
import { useAuth, can } from './auth.jsx';
import { RESOURCES, humanize } from './config.jsx';
import { Drawer } from './RecordDrawer.jsx';

const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const set = (o, p, v) => {
  const keys = p.split('.');
  const copy = { ...o };
  let cur = copy;
  keys.slice(0, -1).forEach((k) => { cur[k] = { ...(cur[k] || {}) }; cur = cur[k]; });
  cur[keys.at(-1)] = v;
  return copy;
};

function toForm(doc, fields) {
  const f = {};
  for (const fd of fields) {
    const v = get(doc, fd.key);
    if (fd.type === 'list') f[fd.key] = (v || []).join('\n');
    else if (fd.type === 'money') f[fd.key] = v != null ? v / 100 : '';
    else if (fd.type === 'date') f[fd.key] = v ? String(v).slice(0, 10) : '';
    else if (fd.type === 'checkbox') f[fd.key] = Boolean(v);
    else f[fd.key] = v ?? '';
  }
  return f;
}

function toBody(form, fields) {
  let body = {};
  for (const fd of fields) {
    let v = form[fd.key];
    if (fd.type === 'list') v = v.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (fd.type === 'money') v = v === '' ? undefined : Math.round(Number(v) * 100);
    else if (fd.type === 'number') v = v === '' ? undefined : Number(v);
    else if (fd.type === 'date') v = v || undefined;
    else if (fd.type === 'select' && v === '') v = fd.key === 'track' ? null : undefined;
    else if (typeof v === 'string' && v.trim() === '' && !fd.required) v = undefined;
    if (v !== undefined) body = set(body, fd.key, v);
  }
  return body;
}

export function ContentEditor({ resource, id, onClose }) {
  const cfg = RESOURCES[resource];
  const { call, user } = useAuth();
  const [form, setForm] = useState(id ? null : toForm({ status: 'draft', pricing: { model: 'quote' } }, cfg.fields));
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) call('GET', `/admin/${resource}/${id}`).then((r) => setForm(toForm(r.data, cfg.fields))).catch((e) => setMsg(e.message));
  }, [call, resource, id, cfg.fields]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMsg('');
    try {
      const body = toBody(form, cfg.fields);
      if (id) await call('PATCH', `/admin/${resource}/${id}`, body);
      else await call('POST', `/admin/${resource}`, body);
      onClose(true);
    } catch (err) {
      setMsg(err.message);
      setErrors(Object.fromEntries((err.details || []).map((d) => [d.path, d.message])));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete this ${cfg.singular}? Its page will stop working.`)) return;
    await call('DELETE', `/admin/${resource}/${id}`).then(() => onClose(true)).catch((e) => setMsg(e.message));
  };

  return (
    <Drawer title={id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`} onClose={onClose}>
      {msg ? <div className="form-error" role="alert">{msg}</div> : null}
      {form ? (
        <form className="form" onSubmit={save} noValidate>
          {cfg.fields.map((fd) => {
            const fid = `f-${fd.key}`;
            const label = fd.label || humanize(fd.key.replace('.', ' '));
            const common = { id: fid, 'aria-invalid': errors[fd.key] ? 'true' : undefined };
            const onChange = (e) => setForm({ ...form, [fd.key]: fd.type === 'checkbox' ? e.target.checked : e.target.value });
            let input;
            if (fd.type === 'checkbox') return <label key={fd.key} className="check"><input type="checkbox" checked={form[fd.key]} onChange={onChange} /> <span>{label}</span></label>;
            if (fd.type === 'select') input = <select className="select" {...common} value={form[fd.key]} onChange={onChange}>{fd.options.map((o) => <option key={o} value={o}>{o ? humanize(o) : 'None'}</option>)}</select>;
            else if (['textarea', 'list', 'markdown'].includes(fd.type)) input = <textarea className="textarea" rows={fd.type === 'markdown' ? 16 : fd.type === 'list' ? 5 : 3} {...common} value={form[fd.key]} onChange={onChange} style={fd.type === 'markdown' ? { fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem' } : undefined} />;
            else input = <input className="input" type={fd.type === 'money' || fd.type === 'number' ? 'number' : fd.type === 'date' ? 'date' : 'text'} step={fd.type === 'money' ? '0.01' : undefined} {...common} value={form[fd.key]} onChange={onChange} />;
            return (
              <div key={fd.key} className="field">
                <label htmlFor={fid}>{label}{fd.type === 'money' ? ' (GHS)' : ''}{fd.required ? '' : <span className="optional"> (optional)</span>}</label>
                {fd.type === 'list' ? <p className="hint">One item per line.</p> : null}
                {fd.hint ? <p className="hint">{fd.hint}</p> : null}
                {input}
                {errors[fd.key] ? <p className="error-text">{errors[fd.key]}</p> : null}
              </div>
            );
          })}
          <div className="actions">
            <button className="btn" disabled={busy}>{busy ? 'Saving' : 'Save'}</button>
            {id && can(user, ['owner', 'admin']) ? <button type="button" className="btn btn--ghost" onClick={remove}>Delete</button> : null}
          </div>
        </form>
      ) : <p>Loading</p>}
    </Drawer>
  );
}
