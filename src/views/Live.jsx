// Props:
//   bills   — array of bill objects (full schema)
//   counts  — { total, reviewed, remaining }
export default function Live({ bills, counts }) {
  return (
    <div>
      <h1>Live</h1>
      <pre>{JSON.stringify({ counts }, null, 2)}</pre>
    </div>
  )
}
