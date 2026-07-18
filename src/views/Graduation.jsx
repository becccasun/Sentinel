// Props:
//   bills   — array of bill objects (full schema, verdicts set)
//   counts  — { total, reviewed, remaining }
export default function Graduation({ bills, counts }) {
  return (
    <div>
      <h1>Graduation</h1>
      <pre>{JSON.stringify({ counts }, null, 2)}</pre>
    </div>
  )
}
