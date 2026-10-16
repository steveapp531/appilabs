import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, can } from './auth.jsx';
import { money, date } from '../lib/format.js';
import { humanize } from './config.jsx';

export function Bars({ data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <p className="muted">No data yet.</p>;
  return (
    <ul className="bars">
      {entries.map(([k, v]) => (
        <li key={k}><span title={k}>{/^[a-z_]+$/.test(k) ? humanize(k) : k}</span><span className="bar" style={{ width: `${(v / max) * 100}%` }} /><b>{v}</b></li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const { call, user } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const ops = can(user, ['owner', 'admin']);
  useEffect(() => { if (ops) call('GET', '/admin/dashboard').then((r) => setD(r.data)).catch((e) => setErr(e.message)); }, [call, ops]);
  if (!ops) return (<div><header className="admin-head"><h1>Welcome, {user.name}</h1></header><p>As an editor you can manage <Link to="/admin/blog">insights</Link>, <Link to="/admin/services">services</Link>, <Link to="/admin/courses">courses</Link> and <Link to="/admin/case-studies">case studies</Link>.</p></div>);
  if (err) return <div className="form-error">{err}</div>;
  if (!d) return <p className="muted">Loading overview</p>;
  const m = d.metrics;
  const tiles = [
    ['New leads awaiting reply', m.newLeads, '/admin/leads'],
    ['Leads this week', m.leadsThisWeek, '/admin/leads'],
    ['Open consultations', m.openBookings, '/admin/bookings'],
    ['Open research requests', m.openResearchRequests, '/admin/research-requests'],
    ['Paid enrollments', m.paidEnrollments, '/admin/enrollments'],
    ['Active subscribers', m.activeSubscribers, '/admin/subscribers'],
    ['Revenue collected online', money(m.revenueMinor), '/admin/payments'],
  ];
  return (
    <div>
      <header className="admin-head"><h1>Overview</h1></header>
      <div className="tiles">
        {tiles.map(([label, value, to]) => (ops ? <Link key={label} to={to} className="tile"><b>{value}</b><span>{label}</span></Link> : <div key={label} className="tile"><b>{value}</b><span>{label}</span></div>))}
      </div>
      <div className="admin-grid">
        <section className="admin-card"><h2>Leads by status</h2><Bars data={d.leadStatus} /></section>
        <section className="admin-card"><h2>Lead sources, last 30 days</h2><Bars data={d.sources30d} /></section>
        <section className="admin-card"><h2>Latest leads</h2>
          <ul className="plain">{d.recentLeads.map((l) => <li key={l._id}><strong>{l.name}</strong> <span className="muted">{humanize(l.type)}, {l.pillar}, {date(l.createdAt)}</span> <span className={`badge badge--${l.status}`}>{humanize(l.status)}</span></li>)}</ul>
        </section>
        <section className="admin-card"><h2>Latest research requests</h2>
          <ul className="plain">{d.recentResearch.map((r) => <li key={r._id}><strong>{r.name}</strong> <span className="muted">{r.serviceSlug}, due {date(r.deadline)}</span> <span className={`badge badge--${r.status}`}>{humanize(r.status)}</span></li>)}</ul>
        </section>
      </div>
    </div>
  );
}
