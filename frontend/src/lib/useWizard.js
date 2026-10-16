import { useEffect, useState } from 'react';

/** Step state for short onboarding flows, with draft saved to sessionStorage so a refresh does not lose progress. */
export function useWizard(key, total, form) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`apl_draft_${key}`) || 'null');
      if (saved?.values) {
        for (const [k, v] of Object.entries(saved.values)) if (v !== undefined && v !== '' && !form.getValues(k)) form.setValue(k, v);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        const { website: _w, agree: _a, integrityAcknowledged: _i, ...rest } = values;
        sessionStorage.setItem(`apl_draft_${key}`, JSON.stringify({ values: rest }));
      } catch {
        /* ignore */
      }
    });
    return () => sub.unsubscribe();
  }, [form, key]);

  const clear = () => {
    try {
      sessionStorage.removeItem(`apl_draft_${key}`);
    } catch {
      /* ignore */
    }
  };
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  return { step, setStep, next, back, clear, isLast: step === total - 1 };
}

/** Validates only the fields of the current step against its zod schema. */
export function validateStep(schema, values, setError, clearErrors) {
  const res = schema.safeParse(values);
  clearErrors(Object.keys(schema.shape));
  if (res.success) return true;
  for (const issue of res.error.issues) setError(issue.path.join('.'), { type: 'step', message: issue.message });
  const first = document.querySelector('[aria-invalid="true"]');
  first?.focus?.();
  return false;
}
