import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api.js';
import { track } from '../lib/analytics.js';
import { getAttribution } from '../lib/attribution.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Tick the box to confirm' }) }),
});

export function NewsletterForm({ source = 'site', variant, labelledBy }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await api.post('/newsletter/subscribe', { ...values, source, attribution: getAttribution() });
      track('newsletter_subscribe', { source });
      setDone(true);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (done) return <p role="status">Check your inbox and confirm your subscription.</p>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby={labelledBy}>
      <div className={variant === 'inline' ? 'newsletter-inline' : 'form'}>
        <label className="visually-hidden" htmlFor={`nl-${source}`}>Email address</label>
        <input id={`nl-${source}`} className="input" type="email" placeholder="you@company.com" autoComplete="email" aria-invalid={errors.email ? 'true' : undefined} {...register('email')} />
        <button className="btn btn--signal" disabled={isSubmitting}>{isSubmitting ? 'Subscribing' : 'Subscribe'}</button>
      </div>
      <label className="check" style={{ marginTop: '0.75rem' }}>
        <input type="checkbox" {...register('consent')} />
        <span>Email me practical notes on software, data and research. Unsubscribe any time.</span>
      </label>
      {(errors.email || errors.consent || serverError) && (
        <p className="error-text" role="alert">{errors.email?.message || errors.consent?.message || serverError}</p>
      )}
    </form>
  );
}
