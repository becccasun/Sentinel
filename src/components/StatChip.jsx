// Tiny inline label chip. tone: 'approve' | 'flag' | 'reject' | 'neutral' | 'accent'.
export default function StatChip({ tone = 'neutral', children }) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}
