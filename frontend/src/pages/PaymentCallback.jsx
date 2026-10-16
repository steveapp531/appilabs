import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { api } from '../lib/api.js';
import { track } from '../lib/analytics.js';

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const [state, setState] = useState({ status: reference ? 'checking' : 'missing' });

  useEffect(() => {
    if (!reference) return;
    let tries = 0;
    let timer;
    const check = () => {
      api.get(`/payments/verify/${encodeURIComponent(reference)}`)
        .then(({ data }) => {
          if (data.status === 'success') {
            track('payment_success', { reference });
            setState({ status: 'success', enrollment: data.enrollment });
          } else if (data.status === 'pending' && tries++ < 5) timer = setTimeout(check, 3000);
          else setState({ status: data.status });
        })
        .catch((err) => setState({ status: 'error', message: err.message }));
    };
    check();
    return () => clearTimeout(timer);
  }, [reference]);

  const view = {
    checking: ['Confirming your payment', 'This takes a few seconds. Please keep this page open.'],
    success: ['Payment confirmed', `Your place${state.enrollment?.courseTitle ? ` on ${state.enrollment.courseTitle}` : ''} is secured. A receipt and joining details are on their way by email.`],
    failed: ['Payment was not completed', 'No money was taken. You can try again from the course page.'],
    abandoned: ['Payment was not completed', 'It looks like the payment was cancelled. You can try again from the course page.'],
    pending: ['Payment still processing', 'Your bank has not confirmed yet. We will email you as soon as it does.'],
    missing: ['No payment reference', 'Open this page from the payment provider, or contact us with your receipt.'],
    error: ['We could not confirm your payment', state.message || 'Please contact us with your payment reference.'],
  }[state.status] || ['Payment status unknown', 'Please contact us with your reference.'];

  return (
    <section className="section section--flush status-page" aria-live="polite">
      <Seo title="Payment" noindex />
      <div className="container">
        <h1 style={{ fontSize: 'var(--step-4)' }}>{view[0]}</h1>
        <p className="lede">{view[1]}</p>
        {reference ? <p className="hint">Reference: {reference}</p> : null}
        {params.get('mock') ? <p className="notice">Demo mode: this payment was simulated. No real money moved.</p> : null}
        <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="btn" to="/academy/courses">Back to courses</Link>
          <Link className="btn btn--ghost" to="/contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
