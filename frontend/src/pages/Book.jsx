import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { TextField, TextArea, SelectField, Honeypot, FormError } from '../components/form/Field.jsx';
import { bookingSchema } from '../lib/schemas.js';
import { api, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { useSettings } from '../lib/settings.jsx';
import { topicOptions } from './Contact.jsx';

const modes = [{ value: 'video', label: 'Video call' }, { value: 'phone', label: 'Phone call' }, { value: 'in_person', label: 'In person, Accra' }];

export default function Book() {
  const navigate = useNavigate();
  const { bookingEnabled } = useSettings();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(bookingSchema), defaultValues: { pillar: 'general', mode: 'video' } });

  const onSubmit = async ({ date1, date2, ...v }) => {
    setFormError('');
    try {
      const preferredDates = [date1, date2].filter(Boolean).map((d) => new Date(d).toISOString());
      await api.post('/bookings', { ...v, preferredDates, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, attribution: getAttribution() });
      track('consultation_request', { pillar: v.pillar });
      navigate('/thank-you?type=booking');
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  };

  return (
    <>
      <Seo title="Book a consultation" description="Book a free 30 minute discovery call with AppiLabs about software, data, training or research support." path="/book" />
      <PageHero title="Book a consultation" lede="A free 30 minute call to understand your goals and suggest a next step. Choose times that suit you and we will confirm by email." />
      <section className="section section--surface">
        <div className="container">
          {!bookingEnabled ? (
            <p className="notice">Online booking is paused. Please <Link to="/contact">send us a message</Link> instead.</p>
          ) : (
            <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Consultation booking">
              <FormError message={formError} />
              <div className="form-row">
                <TextField label="Name" autoComplete="name" register={register('name')} error={errors.name} />
                <TextField label="Email" type="email" autoComplete="email" register={register('email')} error={errors.email} />
              </div>
              <div className="form-row">
                <TextField label="Phone" optional type="tel" autoComplete="tel" register={register('phone')} error={errors.phone} />
                <TextField label="Organisation" optional register={register('company')} error={errors.company} />
              </div>
              <div className="form-row">
                <SelectField label="Area" options={topicOptions} register={register('pillar')} error={errors.pillar} />
                <SelectField label="How should we meet?" options={modes} register={register('mode')} error={errors.mode} />
              </div>
              <TextField label="What would you like to discuss?" register={register('topic')} error={errors.topic} />
              <div className="form-row">
                <TextField label="Preferred date and time" type="datetime-local" hint="Your local time" register={register('date1')} error={errors.date1} />
                <TextField label="Second option" optional type="datetime-local" register={register('date2')} error={errors.date2} />
              </div>
              <TextArea label="Anything we should know beforehand?" optional rows={3} register={register('notes')} error={errors.notes} />
              <Honeypot register={register('website')} />
              <div><button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending' : 'Request consultation'}</button></div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
