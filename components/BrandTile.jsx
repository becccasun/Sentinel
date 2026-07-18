import { BRAND } from '@/lib/brand';

const luminance = hex => {
  const n = parseInt(hex, 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/* Real brand mark when simple-icons has one, letter tile otherwise. */
export default function BrandTile({ id, letter, color, size = 38, radius = 10 }) {
  const b = BRAND[id];
  const style = { width: size, height: size, borderRadius: radius, flex: `0 0 ${size}px` };
  if (!b) return <span className="av" style={{ ...style, background: color }}>{letter}</span>;
  const glyph = luminance(b.hex) > 0.62 ? '#0c0a08' : '#fff';
  return (
    <span className="av" style={{ ...style, background: '#' + b.hex }} title={b.title}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill={glyph} aria-hidden="true">
        <path d={b.path} />
      </svg>
    </span>
  );
}
