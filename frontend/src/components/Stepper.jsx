export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" style={{ '--n': steps.length }} aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? 'step' : undefined} className={i < current ? 'is-done' : undefined}>
          <span className="visually-hidden">Step {i + 1} of {steps.length}: </span>{s}
        </li>
      ))}
    </ol>
  );
}
