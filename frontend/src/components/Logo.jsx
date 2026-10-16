import { Link } from 'react-router-dom';

// The mark: a grid that fills from sparse to dense. Structure that scales.
export function LogoMark({ className }) {
  const cells = [1, 0.55, 0.3, 1, 1, 0.55, 1, 1, 1];
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="currentColor" />
      {cells.map((o, i) => (
        <rect key={i} x={7 + (i % 3) * 7} y={7 + Math.floor(i / 3) * 7} width="5" height="5" fill="#E0A526" opacity={o} />
      ))}
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="AppiLabs home">
      <LogoMark />
      <span>AppiLabs</span>
    </Link>
  );
}
