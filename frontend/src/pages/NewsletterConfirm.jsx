import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { api } from '../lib/api.js';

export default function NewsletterConfirm() {
  const [params] = useSearchParams();
  const [state, setState] = useState('working');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');
    const unsub = params.get('unsubscribe');
    const call = unsub ? api.post('/newsletter/unsubscribe', { email, token: unsub }) : api.post('/newsletter/confirm', { token });
    call.then(() => setState(unsub ? 'unsubscribed' : 'confirmed')).catch((e) => { setState('error'); setMessage(e.message); });
  }, [params]);
  const text = { working: 'One moment', confirmed: 'Subscription confirmed', unsubscribed: 'You are unsubscribed', error: 'This link did not work' }[state];
  return (
    <section className="section section--flush status-page" aria-live="polite">
      <Seo title="Newsletter" noindex />
      <div className="container">
        <h1 style={{ fontSize: 'var(--step-4)' }}>{text}</h1>
        {state === 'confirmed' ? <p className="lede">Thanks. You will get our next issue by email.</p> : null}
        {state === 'unsubscribed' ? <p className="lede">You will not receive further newsletters.</p> : null}
        {state === 'error' ? <p className="lede">{message}</p> : null}
        <Link className="btn" to="/">Go to the homepage</Link>
      </div>
    </section>
  );
}
