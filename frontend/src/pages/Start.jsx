import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { Stepper } from '../components/Stepper.jsx';
import { TextField, TextArea, SelectField, Checkbox, ChoiceCards, FileField, Honeypot, FormError } from '../components/form/Field.jsx';
import { projectSteps } from '../lib/schemas.js';
import { useWizard, validateStep } from '../lib/useWizard.js';
import { submitWithFiles, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { pillars, servicesFor, pillarByKey } from '../lib/content.js';

const STEPS = ['Area', 'Your goal', 'Contact details'];
const timelines = ['As soon as possible', 'Within a month', '1-3 months', '3-6 months', 'Just exploring'].map((v) => ({ value: v, label: v }));
const budgets = ['Under GHS 10k', 'GHS 10k-50k', 'GHS 50k-100k', 'GHS 100k+', 'Not sure yet'].map((v) => ({ value: v, label: v }));

export default function Start() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm({ defaultValues: { pillar: params.get('pillar') || '', serviceSlug: params.get('service') || '', goal: '', marketingConsent: false } });
  const { register, handleSubmit, setError, clearErrors, getValues, watch, formState: { errors, isSubmitting } } = form;
  const wiz = useWizard('start', STEPS.length, form);
  const [files, setFiles] = useState({ list: [], error: null });
  const [formError, setFormError] = useState('');
  const pillar = watch('pillar');

  useEffect(() => {
    if (params.get('pillar') && params.get('service')) wiz.setStep(1);
    track('form_start', { form: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => {
    if (validateStep(projectSteps[wiz.step], getValues(), setError, clearErrors)) wiz.next();
  };

  const onSubmit = async (values) => {
    if (!wiz.isLast) return goNext();
    if (!validateStep(projectSteps[2], values, setError, clearErrors)) return;
    if (files.error) return;
    setFormError('');
    try {
      const type = values.pillar === 'academy' && values.serviceSlug === 'corporate-training' ? 'corporate_training' : 'project';
      const { serviceSlug, ...rest } = values;
      await submitWithFiles('/leads', { ...rest, type, serviceSlug: serviceSlug && serviceSlug !== 'corporate-training' && serviceSlug !== 'unsure' ? serviceSlug : undefined, attribution: getAttribution() }, files.list);
      track('form_submit', { form: 'start', pillar: values.pillar });
      wiz.clear();
      navigate('/thank-you?type=project');
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
      if (err.details?.some((d) => ['goal', 'message'].includes(d.path))) wiz.setStep(1);
    }
  };

  const serviceOptions = pillar === 'academy'
    ? [{ value: 'corporate-training', label: 'Training for my team' }, { value: 'unsure', label: 'Not sure yet' }]
    : [...(pillar ? servicesFor(pillar).filter((s) => !s.track).map((s) => ({ value: s.slug, label: s.title })) : []), { value: 'unsure', label: 'Not sure yet' }];

  return (
    <>
      <Seo title="Start a project" description="Tell us about your project in three short steps. We reply within one working day." path="/start" />
      <PageHero title="Start a project" lede="Three short steps. No account needed. We reply within one working day." />
      <section className="section section--surface">
        <div className="container" style={{ maxWidth: '48rem', marginLeft: 0 }}>
          <Stepper steps={STEPS} current={wiz.step} />
          <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label={`Start a project, step ${wiz.step + 1}: ${STEPS[wiz.step]}`}>
            <FormError message={formError} />
            {wiz.step === 0 && (
              <ChoiceCards
                legend="What do you need help with?"
                name="pillar"
                register={register('pillar')}
                error={errors.pillar}
                options={pillars.map((p) => ({ value: p.key, label: p.name, detail: p.summary }))}
              />
            )}
            {wiz.step === 1 && (
              <>
                {pillar === 'academy' ? (
                  <div className="notice k-academy">
                    <p>Enrolling yourself? <Link to="/academy/courses">Choose a course</Link>. Need research support? <Link to="/academy/research/request">Use the research request form</Link>.</p>
                  </div>
                ) : null}
                <SelectField label={`Which ${pillarByKey[pillar]?.name || ''} service?`} optional options={serviceOptions} register={register('serviceSlug')} error={errors.serviceSlug} />
                <TextArea label="What are you trying to achieve?" hint="A sentence or two is enough. For example: replace our order spreadsheet with a system the sales team can use on their phones." register={register('goal')} error={errors.goal} />
                <div className="form-row">
                  <SelectField label="Timeline" optional options={timelines} register={register('timeline')} />
                  <SelectField label="Budget range" optional hint="Helps us suggest the right scope." options={budgets} register={register('budget')} />
                </div>
              </>
            )}
            {wiz.step === 2 && (
              <>
                <div className="form-row">
                  <TextField label="Name" autoComplete="name" register={register('name')} error={errors.name} />
                  <TextField label="Email" type="email" autoComplete="email" hint="We send our reply here." register={register('email')} error={errors.email} />
                </div>
                <div className="form-row">
                  <TextField label="Phone" optional type="tel" autoComplete="tel" register={register('phone')} error={errors.phone} />
                  <TextField label="Organisation" optional autoComplete="organization" register={register('company')} error={errors.company} />
                </div>
                <FileField label="Supporting files" hint="A brief, spec or screenshots help us reply with specifics. Up to 3 files, 10 MB each." files={files} onChange={setFiles} />
                <Checkbox label="Send me occasional practical notes by email. I can unsubscribe any time." register={register('marketingConsent')} />
                <Honeypot register={register('website')} />
              </>
            )}
            <div className="actions">
              {wiz.step > 0 ? <button type="button" className="btn btn--ghost" onClick={wiz.back}>Back</button> : null}
              {wiz.isLast ? (
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending' : 'Send project details'}</button>
              ) : (
                <button type="button" className="btn" onClick={goNext}>Continue</button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
