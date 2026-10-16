import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resources } from '@content';
import { Seo } from '../components/Seo.jsx';
import { PageHero, CtaBand } from '../components/blocks.jsx';
import { TextField, Checkbox, Honeypot, FormError } from '../components/form/Field.jsx';
import { api, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { nameField, emailField } from '../lib/schemas.js';

const schema = z.object({ name: nameField, email: emailField, marketingConsent: z.boolean().optional(), website: z.string().optional() });

function ResourceForm({ r }) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (v) => {
    setErr('');
    try {
      const res = await api.post(`/resources/${r.slug}/request`, { ...v, attribution: getAttribution() });
      track('resource_download', { resource: r.slug });
      setUrl(res.data.downloadUrl);
    } catch (e) {
      setErr(applyServerErrors(e, setError));
    }
  };
  if (url) return <p role="status">Ready. <a className="text-link" href={url} download>Download {r.title}</a>. We also emailed you the link.</p>;
  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label={`Get ${r.title}`}>
      <FormError message={err} />
      <TextField label="Name" autoComplete="name" register={register('name')} error={errors.name} />
      <TextField label="Email" type="email" autoComplete="email" register={register('email')} error={errors.email} />
      <Checkbox label="Also send me occasional practical notes. Unsubscribe any time." register={register('marketingConsent')} />
      <Honeypot register={register('website')} />
      <div><button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Preparing' : 'Get the download'}</button></div>
    </form>
  );
}

export default function Resources() {
  return (
    <>
      <Seo title="Free resources" description="Free checklists and templates on data readiness and research planning." path="/resources" />
      <PageHero title="Free resources" lede="Practical tools you can use today. Enter your email and the download starts straight away." />
      <section className="section section--surface">
        <div className="container resource-grid">
          {resources.map((r) => (
            <article key={r.slug} className={`resource k-${r.pillar}`} style={{ '--k': `var(--${r.pillar})` }}>
              <h2 style={{ fontSize: 'var(--step-2)' }}>{r.title}</h2>
              <p className="muted">{r.summary}</p>
              <ResourceForm r={r} />
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
