import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { academicLevels, integrityPolicy } from '@content';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { Stepper } from '../components/Stepper.jsx';
import { TextField, TextArea, SelectField, Checkbox, ChoiceCards, FileField, Honeypot, FormError } from '../components/form/Field.jsx';
import { researchSteps } from '../lib/schemas.js';
import { useWizard, validateStep } from '../lib/useWizard.js';
import { submitWithFiles, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { researchServices } from '../lib/content.js';

const STEPS = ['Service and level', 'Your research', 'Contact and files'];
const modes = [
  { value: 'sessions', label: 'Live sessions', detail: 'One-to-one video calls' },
  { value: 'written_feedback', label: 'Written feedback', detail: 'Comments on your drafts' },
  { value: 'both', label: 'Both', detail: 'Sessions plus written feedback' },
];

export default function ResearchRequest() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm({ defaultValues: { serviceSlug: params.get('service') || '', supportMode: 'both', integrityAcknowledged: false } });
  const { register, handleSubmit, setError, clearErrors, getValues, formState: { errors, isSubmitting } } = form;
  const wiz = useWizard('research', STEPS.length, form);
  const [files, setFiles] = useState({ list: [], error: null });
  const [formError, setFormError] = useState('');
  const today = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const goNext = () => validateStep(researchSteps[wiz.step], getValues(), setError, clearErrors) && wiz.next();
  const onSubmit = async (values) => {
    if (!wiz.isLast) return goNext();
    if (!validateStep(researchSteps[2], values, setError, clearErrors) || files.error) return;
    setFormError('');
    try {
      await submitWithFiles('/research-requests', { ...values, attribution: getAttribution() }, files.list);
      wiz.clear();
      track('research_request', { service: values.serviceSlug, level: values.academicLevel });
      navigate('/thank-you?type=research');
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
      const firstStep = researchSteps.findIndex((s) => err.details?.some((d) => d.path in s.shape));
      if (firstStep >= 0) wiz.setStep(firstStep);
    }
  };

  return (
    <>
      <Seo title="Request research support" description="Request academic research guidance, analysis support or editing in three steps." path="/academy/research/request" />
      <PageHero kicker="Academy" pillar="academy" title="Request research support" lede="Three short steps. We reply within one working day with a plan and a quote." />
      <section className="section section--surface">
        <div className="container" style={{ maxWidth: '48rem', marginLeft: 0 }}>
          <Stepper steps={STEPS} current={wiz.step} />
          <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label={`Research request, step ${wiz.step + 1}: ${STEPS[wiz.step]}`}>
            <FormError message={formError} />
            {wiz.step === 0 && (
              <>
                <SelectField label="Type of support" options={researchServices.map((s) => ({ value: s.slug, label: s.title }))} register={register('serviceSlug')} error={errors.serviceSlug} />
                <SelectField label="Level of study" hint="So we match you with the right depth of support." options={academicLevels} register={register('academicLevel')} error={errors.academicLevel} />
                <TextField label="Discipline or programme" hint="For example: Public Health, MBA, Information Systems." register={register('discipline')} error={errors.discipline} />
              </>
            )}
            {wiz.step === 1 && (
              <>
                <TextField label="Research topic or working title" register={register('topic')} error={errors.topic} />
                <TextArea label="What do you need help with?" hint="Where you are now, what is blocking you, and any requirements from your supervisor or institution." register={register('requirements')} error={errors.requirements} />
                <div className="form-row">
                  <TextField label="Your deadline" type="date" min={today} hint="We plan the work backwards from this date." register={register('deadline')} error={errors.deadline} />
                  <TextField label="Institution" optional register={register('institution')} />
                </div>
                <ChoiceCards legend="How would you like support?" name="supportMode" register={register('supportMode')} error={errors.supportMode} options={modes} />
              </>
            )}
            {wiz.step === 2 && (
              <>
                <div className="form-row">
                  <TextField label="Name" autoComplete="name" register={register('name')} error={errors.name} />
                  <TextField label="Email" type="email" autoComplete="email" register={register('email')} error={errors.email} />
                </div>
                <TextField label="Phone or WhatsApp" optional type="tel" hint="Useful for scheduling sessions." autoComplete="tel" register={register('phone')} error={errors.phone} />
                <FileField label="Guidelines, drafts or data" hint="Files are stored privately and deleted after 180 days. Up to 3 files, 10 MB each." files={files} onChange={setFiles} />
                <div className="notice integrity">
                  <ul>{integrityPolicy.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
                <Checkbox label="I understand AppiLabs provides guidance, tutoring, analysis support and feedback, and that the work I submit must be my own." register={register('integrityAcknowledged')} error={errors.integrityAcknowledged} />
                <Honeypot register={register('website')} />
                <p className="hint">See how we handle your files in our <Link to="/privacy">privacy policy</Link>.</p>
              </>
            )}
            <div className="actions">
              {wiz.step > 0 ? <button type="button" className="btn btn--ghost" onClick={wiz.back}>Back</button> : null}
              {wiz.isLast ? (
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending' : 'Send request'}</button>
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
