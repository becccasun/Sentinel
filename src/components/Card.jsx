// Dumb card surface. Optional 3px left border for verdict state via `accentColor`.
export default function Card({ children, accentColor, className = '', style = {}, ...props }) {
  const borderStyle = accentColor
    ? { borderLeft: `3px solid ${accentColor}`, ...style }
    : style;
  return (
    <div className={`card ${className}`.trim()} style={borderStyle} {...props}>
      {children}
    </div>
  );
}
