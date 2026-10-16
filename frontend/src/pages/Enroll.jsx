import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { Stepper } from '../components/Stepper.jsx';
import { TextField, TextArea, SelectField, Checkbox, Honeypot, FormError } from '../components/form/Field.jsx';
import { enrollSteps } from '../lib/schemas.js';
import { useWizard, validateStep } from '../lib/useWizard.js';
import { api, applyServerErrors } from '../lib/api.js';
import { getAttribution } from '../lib/attribution.js';
import { track } from '../lib/analytics.js';
import { courses } from '../lib/content.js';
import { useResource } from '../lib/data.jsx';
import { money } from '../lib/format.js';

const STEPS = ['Course', 'Your details', 'Confirm'];
const levels = [{ value: 'new', label: 'New to the topic' }, { value: 'some', label: 'Some experience' }, { value: 'experienced', label: 'Experienced, filling gaps' }];

export default function Enroll() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: list } = useResource('/courses', courses);
  const form = useForm({ defaultValues: { courseSlug: slug || '', agree: false } });
  const { register, handleSubmit, setError, clearErrors, getValues, watch, formState: { errors, isSubmitting } } = form;
  const wiz = useWizard('enroll', STEPS.length, form);
  const [formError, setFormError] = useState('');
  const course = (list || []).find((c) => c.slug === watch('courseSlug'));

  useEffect(() => {
    if (slug) form.setValue('courseSlug', slug);
    track('enrollment_start', { course: slug || 'none' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const goNext = () => validateStep(enrollSteps[wiz.step], getValues(), setError, clearErrors) && wiz.next();

  const onSubmit = async ({ agree: _a, ...values }) => {
    if (!wiz.isLast) return goNext();
    if (!validateStep(enrollSteps[2], getValues(), setError, clearErrors)) return;
    setFormError('');
    try {
      const res = await api.post('/enrollments', { ...values, experienceLevel: values.experienceLevel || undefined, attribution: getAttribution() });
      wiz.clear();
      track('form_submit', { form: 'enroll', course: values.courseSlug });
      if (res.data.payment?.authorizationUrl) {
        window.location.assign(res.data.payment.authorizationUrl);
        return;
      }
      navigate('/thank-you?type=enrollment');
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
      if (err.details?.some((d) => ['name', 'email', 'phone'].includes(d.path))) wiz.setStep(1);
    }
  };

  const fee = course?.price ? money(course.price, course.currency) : null;
  return (
    <>
      <Seo title="Enroll in a course" path={slug ? `/enroll/${slug}` : '/enroll'} noindex />
      <PageHero title={course ? `Enroll: ${course.title}` : 'Enroll in a course'} lede="Three steps. Payment is handled securely by Paystack with card or mobile money." />
      <section className="section section--surface">
        <div className="container" style={{ maxWidth: '48rem', marginLeft: 0 }}>
          <Stepper steps={STEPS} current={wiz.step} />
          <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label={`Enrollment, step ${wiz.step + 1}: ${STEPS[wiz.step]}`}>
            <FormError message={formError} />
            {wiz.step === 0 && (
              <>
                <SelectField label="Course" options={(list || []).map((c) => ({ value: c.slug, label: `${c.title} (${c.duration})` }))} register={register('courseSlug')} error={errors.courseSlug} />
                {course ? (
                  <div className="wizard-summary">
                    <p>{course.summary}</p>
                    <dl><dt>Format</dt><dd>{course.format}</dd><dt>Duration</dt><dd>{course.duration}</dd><dt>Fee</dt><dd>{fee || 'On request'}</dd></dl>
                  </div>
                ) : null}
                <p className="hint">Enrolling several people? <Link to="/academy/corporate-training">Ask about group rates</Link>.</p>
              </>
            )}
            {wiz.step === 1 && (
              <>
                <div className="form-row">
                  <TextField label="Full name" hint="As it should appear on your certificate." autoComplete="name" register={register('name')} error={errors.name} />
                  <TextField label="Email" type="email" hint="Joining details are sent here." autoComplete="email" register={register('email')} error={errors.email} />
                </div>
                <div className="form-row">
                  <TextField label="Phone" optional type="tel" hint="For class reminders only." autoComplete="tel" register={register('phone')} error={errors.phone} />
                  <TextField label="Organisation" optional autoComplete="organization" register={register('organization')} />
                </div>
                <SelectField label="Your experience with this topic" optional options={levels} register={register('experienceLevel')} />
                <TextArea label="What do you want to get out of the course?" optional rows={3} hint="Helps the trainer use relevant examples." register={register('goals')} />
              </>
            )}
            {wiz.step === 2 && (
              <>
                <div className="wizard-summary">
                  <dl>
                    <dt>Course</dt><dd>{course?.title}</dd>
                    <dt>Name</dt><dd>{getValues('name')}</dd>
                    <dt>Email</dt><dd>{getValues('email')}</dd>
                    <dt>Fee</dt><dd>{fee || 'No payment needed now'}</dd>
                  </dl>
                </div>
                <Checkbox label={<>I have read the course <Link to="/terms">terms</Link>, including the refund policy.</>} register={register('agree')} error={errors.agree} />
                <Honeypot register={register('website')} />
              </>
            )}
            <div className="actions">
              {wiz.step > 0 ? <button type="button" className="btn btn--ghost" onClick={wiz.back}>Back</button> : null}
              {wiz.isLast ? (
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Processing' : fee ? `Pay ${fee}` : 'Reserve my place'}</button>
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
