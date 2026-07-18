// Dumb button. variant: 'primary' | 'secondary'. Primary (acid-yellow) is used
// exactly once per screen for the main action.
export default function Button({ variant = 'secondary', children, className = '', ...props }) {
  return (
    <button className={`btn btn--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
