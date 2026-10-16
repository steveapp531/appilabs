import { useEffect, useState } from 'react';

// Hero illustration: scattered data points settle into a grid that feeds the three core services.
// Positions are deterministic so server and browser render the same markup before the animation runs.
const COLS = 6;
const ROWS = 7;
const STEP = 30;
const X0 = 36;
const Y0 = 92;

function rand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const dots = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return {
    x: X0 + c * STEP,
    y: Y0 + r * STEP,
    dx: (rand(i + 1) - 0.5) * 220,
    dy: (rand(i + 101) - 0.5) * 260,
    rot: (rand(i + 7) - 0.5) * 120,
    gold: [8, 15, 22, 23, 29, 36].includes(i),
  };
});

const nodes = [
  { key: 'solutions', label: 'Solutions', sub: 'We build', y: 122, color: 'var(--solutions)' },
  { key: 'consulting', label: 'Consulting', sub: 'We advise', y: 212, color: 'var(--consulting)' },
  { key: 'academy', label: 'Academy', sub: 'We train and guide', y: 302, color: 'var(--academy)' },
];
const NX = 252;
const lastX = X0 + (COLS - 1) * STEP;

export function StructureDiagram() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg className={`diagram ${settled ? 'is-settled' : ''}`} viewBox="0 0 420 400" role="img" aria-labelledby="diagram-title">
      <title id="diagram-title">Scattered data points arranged into a structured grid that feeds Solutions, Consulting and Academy.</title>
      {Array.from({ length: ROWS }, (_, r) => (
        <line key={`r${r}`} className="link" x1={X0} x2={lastX} y1={Y0 + r * STEP} y2={Y0 + r * STEP} />
      ))}
      {Array.from({ length: COLS }, (_, c) => (
        <line key={`c${c}`} className="link" x1={X0 + c * STEP} x2={X0 + c * STEP} y1={Y0} y2={Y0 + (ROWS - 1) * STEP} />
      ))}
      {nodes.map((n, i) => {
        const fromY = Y0 + (i * 3) * STEP;
        return <path key={n.key} className="link" d={`M${lastX} ${fromY} C ${lastX + 40} ${fromY}, ${NX - 40} ${n.y}, ${NX} ${n.y}`} fill="none" style={{ stroke: n.color, strokeWidth: 1.5 }} />;
      })}
      {dots.map((d, i) => (
        <rect
          key={i}
          className="dot"
          x={d.x - 3.5}
          y={d.y - 3.5}
          width="7"
          height="7"
          style={{
            fill: d.gold ? 'var(--signal)' : undefined,
            transformBox: 'fill-box',
            transformOrigin: 'center',
            transform: settled ? 'none' : `translate(${d.dx}px, ${d.dy}px) rotate(${d.rot}deg)`,
            transitionDelay: `${(i % 7) * 40}ms`,
            opacity: settled ? 1 : 0.55,
          }}
        />
      ))}
      {nodes.map((n) => (
        <g key={n.key} transform={`translate(${NX} ${n.y - 18})`}>
          <rect width="16" height="36" fill={n.color} />
          <text className="node-label" x="24" y="15">{n.label}</text>
          <text className="node-sub" x="24" y="31">{n.sub}</text>
        </g>
      ))}
    </svg>
  );
}
