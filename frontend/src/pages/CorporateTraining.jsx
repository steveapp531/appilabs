import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { corporateTraining } from '@content';
import { Seo, breadcrumbJsonLd } from '../components/Seo.jsx';
import { PageHero, ProcessSteps, Split, Breadcrumbs } from '../components/blocks.jsx';
import { TextField, TextArea, SelectField, Honeypot, FormError } from '../components/form/Field.jsx';
import { corporateSchema } from '../lib/schemas.js';
import { api, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { findCourse } from '../lib/content.js';

const sizes = ['1-10', '11-25', '26-50', '51-100', '100+'].map((v) => ({ value: v, label: `${v} people` }));

export default function CorporateTraining() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const course = findCourse(params.get('course') || '');
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(corporateSchema),
    defaultValues: { goal: course ? `We are interested in ${course.title} for our team.` : '' },
  });
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Academy', path: '/academy' }, { name: 'Corporate training', path: '/academy/corporate-training' }];

  const onSubmit = async (v) => {
    setFormError('');
    try {
      await api.post('/leads', { ...v, type: 'corporate_training', pillar: 'academy', serviceSlug: course?.slug, attribution: getAttribution() });
      track('form_submit', { form: 'corporate_training' });
      navigate('/thank-you?type=training');
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  };

  return (
    <>
      <Seo title="Corporate training in data and digital skills" description="Tailored training for teams in data analytics, Excel, Power BI, SQL and digital productivity. On site in Accra or online." path="/academy/corporate-training" jsonLd={[breadcrumbJsonLd(crumbs)]} />
      <PageHero kicker="For organisations" pillar="academy" title="Corporate training" lede={corporateTraining.intro}>
        <Breadcrumbs items={crumbs} />
      </PageHero>
      <Split id="how" title="How a programme runs" className="section--surface">
        <ProcessSteps items={corporateTraining.steps} row={false} />
      </Split>
      <Split id="packages" title="Formats">
        <dl className="engagements">{corporateTraining.packages.map((p) => <div key={p.name}><dt>{p.name}</dt><dd>{p.detail}</dd></div>)}</dl>
        <h3 style={{ marginTop: 'var(--s-6)' }}>Popular topics</h3>
        <ul className="checklist k-academy">{corporateTraining.topics.map((t) => <li key={t}>{t}</li>)}</ul>
      </Split>
      <Split id="enquire" title="Plan a programme" intro="Tell us about your team. We reply within one working day with a suggested outline and price." className="section--surface">
        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormError message={formError} />
          <div className="form-row">
            <TextField label="Your name" autoComplete="name" register={register('name')} error={errors.name} />
            <TextField label="Work email" type="email" autoComplete="email" register={register('email')} error={errors.email} />
          </div>
          <div className="form-row">
            <TextField label="Organisation" autoComplete="organization" register={register('company')} error={errors.company} />
            <SelectField label="Team size" options={sizes} register={register('teamSize')} error={errors.teamSize} />
          </div>
          <TextField label="Phone" optional type="tel" autoComplete="tel" register={register('phone')} error={errors.phone} />
          <TextArea label="What should your team be able to do after the training?" register={register('goal')} error={errors.goal} />
          <Honeypot register={register('website')} />
          <div><button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending' : 'Send enquiry'}</button></div>
        </form>
      </Split>
    </>
  );
}
