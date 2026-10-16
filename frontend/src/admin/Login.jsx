import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from './auth.jsx';
import { LogoMark } from '../components/Logo.jsx';

export default function Login({ setup }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const firstRun = setup?.needsSetup;
  const [form, setForm] = useState({ name: '', email: '', password: '', setupToken: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = firstRun ? await api.post('/auth/setup', form) : await api.post('/auth/login', { email: form.email, password: form.password });
      signIn(res.data);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.details?.map((d) => d.message).join('. ') || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="form admin-card" onSubmit={submit}>
        <div className="admin-brand"><LogoMark /> AppiLabs admin</div>
        <h1 style={{ fontSize: 'var(--step-3)' }}>{firstRun ? 'Create the owner account' : 'Sign in'}</h1>
        {firstRun && !setup.setupEnabled ? (
          <p className="notice">No administrator exists yet. Set <code>SETUP_TOKEN</code> on the API server and reload, or run <code>npm run create-admin</code> in the backend folder.</p>
        ) : null}
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        {firstRun ? (
          <>
            <div className="field"><label htmlFor="st">Setup token</label><input id="st" className="input" value={form.setupToken} onChange={set('setupToken')} required /><p className="hint">The SETUP_TOKEN value from the API environment. Remove it after setup.</p></div>
            <div className="field"><label htmlFor="nm">Your name</label><input id="nm" className="input" value={form.name} onChange={set('name')} required /></div>
          </>
        ) : null}
        <div className="field"><label htmlFor="em">Email</label><input id="em" className="input" type="email" autoComplete="username" value={form.email} onChange={set('email')} required /></div>
        <div className="field"><label htmlFor="pw">Password</label><input id="pw" className="input" type="password" autoComplete={firstRun ? 'new-password' : 'current-password'} minLength={firstRun ? 10 : undefined} value={form.password} onChange={set('password')} required />{firstRun ? <p className="hint">At least 10 characters.</p> : null}</div>
        <button className="btn" disabled={busy}>{busy ? 'Please wait' : firstRun ? 'Create account' : 'Sign in'}</button>
      </form>
    </div>
  );
}
