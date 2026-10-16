import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { TextField, TextArea, SelectField, Checkbox, Honeypot, FormError } from '../components/form/Field.jsx';
import { contactSchema } from '../lib/schemas.js';
import { api, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { useSettings } from '../lib/settings.jsx';

export const topicOptions = [
  { value: 'general', label: 'General question' },
  { value: 'solutions', label: 'Websites, apps and automation' },
  { value: 'consulting', label: 'IT and data consulting' },
  { value: 'academy', label: 'Training or research support' },
];

export function ContactForm({ onDone }) {
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { pillar: 'general' } });
  const onSubmit = async (v) => {
    setFormError('');
    try {
      await api.post('/leads', { ...v, type: 'contact', attribution: getAttribution() });
      track('form_submit', { form: 'contact', pillar: v.pillar });
      onDone?.();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  };
  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Contact form">
      <FormError message={formError} />
      <div className="form-row">
        <TextField label="Name" autoComplete="name" register={register('name')} error={errors.name} />
        <TextField label="Email" type="email" autoComplete="email" register={register('email')} error={errors.email} />
      </div>
      <div className="form-row">
        <TextField label="Phone" optional type="tel" autoComplete="tel" register={register('phone')} error={errors.phone} />
        <TextField label="Organisation" optional autoComplete="organization" register={register('company')} error={errors.company} />
      </div>
      <SelectField label="What is it about?" options={topicOptions} placeholder="Choose a topic" register={register('pillar')} error={errors.pillar} />
      <TextArea label="Message" register={register('message')} error={errors.message} />
      <Checkbox label="Send me occasional practical notes by email. I can unsubscribe any time." register={register('marketingConsent')} />
      <Honeypot register={register('website')} />
      <p className="hint">We use these details only to reply to you. See our <Link to="/privacy">privacy policy</Link>.</p>
      <div><button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending' : 'Send message'}</button></div>
    </form>
  );
}

export default function Contact() {
  const navigate = useNavigate();
  const s = useSettings();
  return (
    <>
      <Seo title="Contact" description="Contact AppiLabs in Accra about software, data consulting, training or research support." path="/contact" />
      <PageHero title="Contact" lede="Send a message and we will reply within one working day. For a project, the Start a project form gets you a faster, more useful answer." />
      <section className="section section--surface">
        <div className="container detail-grid">
          <ContactForm onDone={() => navigate('/thank-you?type=contact')} />
          <aside>
            <div className="aside-box">
              <h2>Other ways to reach us</h2>
              <dl className="engagements">
                <div><dt>Email</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a></dd></div>
                <div><dt>Phone</dt><dd><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></dd></div>
                {s.whatsapp ? <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${s.whatsapp}`} rel="noopener noreferrer">Message us</a></dd></div> : null}
                <div><dt>Office</dt><dd>{s.address}</dd></div>
                <div><dt>Hours</dt><dd>{s.hours}</dd></div>
              </dl>
              <div className="actions" style={{ marginTop: 'var(--s-5)' }}>
                <Link className="btn btn--ghost" to="/start">Start a project</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
