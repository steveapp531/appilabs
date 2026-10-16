import { useId } from 'react';

function Wrap({ id, label, hint, error, optional, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional ? <span className="optional">(optional)</span> : null}
      </label>
      {hint ? <p className="hint" id={`${id}-hint`}>{hint}</p> : null}
      {children}
      {error ? <p className="error-text" id={`${id}-err`} role="alert">{error.message}</p> : null}
    </div>
  );
}

const aria = (id, hint, error) => ({
  'aria-invalid': error ? 'true' : undefined,
  'aria-describedby': [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined,
});

export function TextField({ label, hint, error, optional, register, type = 'text', ...rest }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional}>
      <input id={id} className="input" type={type} {...aria(id, hint, error)} {...register} {...rest} />
    </Wrap>
  );
}

export function TextArea({ label, hint, error, optional, register, rows = 5, ...rest }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea id={id} className="textarea" rows={rows} {...aria(id, hint, error)} {...register} {...rest} />
    </Wrap>
  );
}

export function SelectField({ label, hint, error, optional, register, options, placeholder = 'Choose an option', ...rest }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error} optional={optional}>
      <select id={id} className="select" {...aria(id, hint, error)} {...register} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrap>
  );
}

export function Checkbox({ label, error, register, ...rest }) {
  const id = useId();
  return (
    <div>
      <label className="check" htmlFor={id}>
        <input id={id} type="checkbox" aria-invalid={error ? 'true' : undefined} {...register} {...rest} />
        <span>{label}</span>
      </label>
      {error ? <p className="error-text" role="alert">{error.message}</p> : null}
    </div>
  );
}

export function ChoiceCards({ legend, name, options, register, error, columns = 3, hint }) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      {hint ? <p className="hint">{hint}</p> : null}
      <div className={`choices choices--${columns}`}>
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input type="radio" value={o.value} name={name} {...register} />
            <strong>{o.label}</strong>
            {o.detail ? <span>{o.detail}</span> : null}
          </label>
        ))}
      </div>
      {error ? <p className="error-text" role="alert">{error.message}</p> : null}
    </fieldset>
  );
}

export const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.pptx,.csv,.txt,.sav';
export function FileField({ label, hint, files, onChange, max = 3, maxMb = 10 }) {
  const id = useId();
  const error = files.error;
  return (
    <div className="field">
      <label htmlFor={id}>{label} <span className="optional">(optional)</span></label>
      <p className="hint" id={`${id}-hint`}>{hint || `Up to ${max} files, ${maxMb} MB each. PDF, Word, Excel, PowerPoint, CSV or SPSS.`}</p>
      <input
        id={id}
        type="file"
        multiple
        accept={ACCEPT}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          const list = Array.from(e.target.files || []);
          if (list.length > max) return onChange({ list: [], error: `Choose at most ${max} files.` });
          const big = list.find((f) => f.size > maxMb * 1024 * 1024);
          if (big) return onChange({ list: [], error: `${big.name} is larger than ${maxMb} MB.` });
          onChange({ list, error: null });
        }}
      />
      {files.list?.length ? <p className="hint">{files.list.map((f) => f.name).join(', ')}</p> : null}
      {error ? <p className="error-text" role="alert">{error}</p> : null}
    </div>
  );
}

/** Invisible field that real users never fill in. Bots usually do. */
export function Honeypot({ register }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>Website<input tabIndex={-1} autoComplete="off" {...register} /></label>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <div className="form-error" role="alert">{message}</div>;
}
