// Props:
//   bills       — array of bill objects (full schema)
//   onVerdict   — (bill_id, verdict) => void
//   counts      — { total, reviewed, remaining }
export default function Review({ bills, onVerdict, counts }) {
  return (
    <div>
      <h1>Review</h1>
      <pre>{JSON.stringify({ counts, sample: bills[0] }, null, 2)}</pre>
    </div>
  )
}
