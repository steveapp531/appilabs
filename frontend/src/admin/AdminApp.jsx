import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './admin.css';
import { AuthProvider, useAuth, can } from './auth.jsx';
import { LogoMark } from '../components/Logo.jsx';
import { api } from '../lib/api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ResourceList from './ResourceList.jsx';
import { Settings, Users, AuditLog, Analytics } from './Pages.jsx';
import { RESOURCES } from './config.jsx';

const OPS = ['owner', 'admin'];

function Shell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const groups = [
    { label: 'Pipeline', items: ['leads', 'bookings', 'enrollments', 'research-requests'].filter(() => can(user, OPS)) },
    { label: 'Content', items: ['services', 'courses', 'blog', 'case-studies'] },
    { label: 'Audience', items: can(user, OPS) ? ['subscribers', 'payments'] : [] },
  ];
  return (
    <div className="admin">
      <aside className="admin-nav">
        <div className="admin-brand"><LogoMark /> AppiLabs admin</div>
        <nav aria-label="Admin">
          <NavLink end to="/admin">Overview</NavLink>
          {groups.map((g) => g.items.length ? (
            <div key={g.label}>
              <p className="admin-nav__group">{g.label}</p>
              {g.items.map((k) => <NavLink key={k} to={`/admin/${k}`}>{RESOURCES[k].title}</NavLink>)}
            </div>
          ) : null)}
          {can(user, OPS) ? (
            <div>
              <p className="admin-nav__group">System</p>
              <NavLink to="/admin/analytics">Analytics</NavLink>
              <NavLink to="/admin/settings">Settings</NavLink>
              {can(user, ['owner']) ? <NavLink to="/admin/users">Users</NavLink> : null}
              <NavLink to="/admin/audit">Audit log</NavLink>
            </div>
          ) : null}
        </nav>
        <div className="admin-user">
          <span>{user.name}<small>{user.role}</small></span>
          <button className="btn btn--ghost btn--sm" onClick={async () => { await signOut(); navigate('/admin/login'); }}>Sign out</button>
        </div>
      </aside>
      <main className="admin-main" id="main">
        <Routes>
          <Route index element={<Dashboard />} />
          {Object.keys(RESOURCES).map((k) => <Route key={k} path={k} element={<ResourceList resource={k} />} />)}
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Gate() {
  const { status } = useAuth();
  const [setup, setSetup] = useState(null);
  useEffect(() => { api.get('/auth/setup-status').then((r) => setSetup(r.data)).catch(() => setSetup({ needsSetup: false })); }, []);
  if (status === 'loading' || !setup) return <p className="admin-loading">Checking your session</p>;
  return (
    <Routes>
      <Route path="login" element={status === 'authed' ? <Navigate to="/admin" replace /> : <Login setup={setup} />} />
      <Route path="*" element={status === 'authed' ? <Shell /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Helmet><title>Admin | AppiLabs</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Gate />
    </AuthProvider>
  );
}
