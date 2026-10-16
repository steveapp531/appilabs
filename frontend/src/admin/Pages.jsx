import { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';
import { Bars } from './Dashboard.jsx';
import { dateTime } from '../lib/format.js';
import { humanize } from './config.jsx';

export function Settings() {
  const { call } = useAuth();
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { call('GET', '/admin/settings').then((r) => setS({ serviceAreas: [], socials: {}, ...r.data })); }, [call]);
  if (!s) return <p className="muted">Loading</p>;
  const field = (k, label, type = 'text') => (
    <div className="field"><label htmlFor={k}>{label}</label><input id={k} className="input" type={type} value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></div>
  );
  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    const { _id, key: _k, createdAt: _c, updatedAt: _u, id: _i, ...body } = s;
    try {
      await call('PUT', '/admin/settings', body);
      setMsg('Settings saved. The public site picks them up within a few minutes.');
    } catch (err) {
      setMsg(err.message);
    }
  };
  return (
    <div>
      <header className="admin-head"><h1>Settings</h1></header>
      <form className="form admin-card" onSubmit={save}>
        {msg ? <p role="status" className="notice">{msg}</p> : null}
        {field('businessName', 'Business name')}
        <div className="form-row">{field('email', 'Public email', 'email')}{field('phone', 'Phone')}</div>
        <div className="form-row">{field('whatsapp', 'WhatsApp number (digits only, with country code)')}{field('hours', 'Opening hours')}</div>
        <div className="form-row">{field('address', 'Address')}{field('city', 'City')}</div>
        <div className="field"><label htmlFor="sa">Service areas</label><p className="hint">One per line. Used on the site and in search engine data.</p><textarea id="sa" className="textarea" rows={4} value={(s.serviceAreas || []).join('\n')} onChange={(e) => setS({ ...s, serviceAreas: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></div>
        <div className="form-row">
          {['linkedin', 'x', 'github', 'youtube'].map((k) => (
            <div key={k} className="field"><label htmlFor={`so-${k}`}>{humanize(k)} URL</label><input id={`so-${k}`} className="input" value={s.socials?.[k] || ''} onChange={(e) => setS({ ...s, socials: { ...s.socials, [k]: e.target.value } })} /></div>
          ))}
        </div>
        {field('announcement', 'Announcement bar (leave empty to hide)')}
        <label className="check"><input type="checkbox" checked={s.showPrices !== false} onChange={(e) => setS({ ...s, showPrices: e.target.checked })} /><span>Show prices on the public site</span></label>
        <label className="check"><input type="checkbox" checked={s.bookingEnabled !== false} onChange={(e) => setS({ ...s, bookingEnabled: e.target.checked })} /><span>Accept consultation bookings</span></label>
        <div><button className="btn">Save settings</button></div>
      </form>
    </div>
  );
}

export function Users() {
  const { call, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'editor', password: '' });
  const [msg, setMsg] = useState('');
  const load = () => call('GET', '/admin/users').then((r) => setUsers(r.data)).catch((e) => setMsg(e.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    try {
      await call('POST', '/admin/users', form);
      setForm({ name: '', email: '', role: 'editor', password: '' });
      setMsg('User created. Share the temporary password securely and ask them to change it.');
      load();
    } catch (err) {
      setMsg(err.details?.map((d) => d.message).join('. ') || err.message);
    }
  };
  const update = (id, body) => call('PATCH', `/admin/users/${id}`, body).then(load).catch((e) => setMsg(e.message));
  return (
    <div>
      <header className="admin-head"><h1>Users</h1></header>
      {msg ? <p className="notice" role="status">{msg}</p> : null}
      <div className="admin-table-wrap admin-card">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Role</th><th>Last sign in</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong><small>{u.email}</small></td>
                <td>{u._id === user.id ? humanize(u.role) : (
                  <select className="select" aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => update(u._id, { role: e.target.value })}>{['owner', 'admin', 'editor'].map((r) => <option key={r} value={r}>{humanize(r)}</option>)}</select>
                )}</td>
                <td>{dateTime(u.lastLoginAt) || 'Never'}</td>
                <td>{u._id === user.id ? 'You' : <button className="btn btn--ghost btn--sm" onClick={() => update(u._id, { active: !u.active })}>{u.active ? 'Deactivate' : 'Reactivate'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="form admin-card" onSubmit={add} style={{ marginTop: '1.5rem' }}>
        <h2>Add a user</h2>
        <div className="form-row">
          <div className="field"><label htmlFor="un">Name</label><input id="un" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="field"><label htmlFor="ue">Email</label><input id="ue" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label htmlFor="ur">Role</label><select id="ur" className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="editor">Editor (content only)</option><option value="admin">Admin (content and customer data)</option></select></div>
          <div className="field"><label htmlFor="up">Temporary password</label><input id="up" type="text" minLength={10} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
        </div>
        <div><button className="btn">Add user</button></div>
      </form>
    </div>
  );
}

export function AuditLog() {
  const { call } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => { call('GET', '/admin/audit-logs?limit=100').then((r) => setRows(r.data)); }, [call]);
  return (
    <div>
      <header className="admin-head"><h1>Audit log</h1></header>
      <p className="muted">Sign ins, exports, file downloads and every change made in the admin.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r._id}><td>{dateTime(r.createdAt)}</td><td>{r.actorEmail}</td><td>{humanize(r.action)}</td><td>{r.entity} {r.meta?.changed ? `(${r.meta.changed.join(', ')})` : ''}</td></tr>)}</tbody>
        </table>
        {!rows.length ? <p className="admin-empty muted">No activity recorded yet.</p> : null}
      </div>
    </div>
  );
}

export function Analytics() {
  const { call } = useAuth();
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  useEffect(() => { call('GET', `/admin/analytics?days=${days}`).then((r) => setD(r.data)); }, [call, days]);
  return (
    <div>
      <header className="admin-head">
        <h1>Analytics</h1>
        <select className="select" aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: 'auto' }}>
          {[7, 30, 90, 365].map((n) => <option key={n} value={n}>Last {n} days</option>)}
        </select>
      </header>
      <p className="muted">First-party events from visitors who accepted analytics. Use Google Analytics 4 for full traffic reporting.</p>
      {d ? (
        <div className="admin-grid">
          <section className="admin-card"><h2>Events</h2><Bars data={d.events} /></section>
          <section className="admin-card"><h2>Lead sources</h2><Bars data={d.leadSources} /></section>
          <section className="admin-card"><h2>Campaigns</h2><Bars data={d.leadCampaigns} /></section>
          <section className="admin-card"><h2>Top pages</h2><Bars data={Object.fromEntries(d.topPages.map((p) => [p.path, p.views]))} /></section>
        </div>
      ) : <p className="muted">Loading</p>}
    </div>
  );
}
