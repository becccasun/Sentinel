'use client';

/* Range input whose track fills up to the thumb, so the dragged area reads
   as covered progress. `ink` renders the dark-on-solar variant. */
export default function Slider({ min, max, step, value, onChange, ink = false }) {
  const pct = ((value - min) / (max - min)) * 100;
  const lo = ink ? 'var(--ink)' : 'var(--brand-500)';
  const hi = ink ? 'rgba(12,10,8,.15)' : 'var(--gray-100)';
  return (
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)}
      style={{ background: `linear-gradient(90deg, ${lo} 0%, ${lo} ${pct}%, ${hi} ${pct}%, ${hi} 100%)` }}
    />
  );
}
