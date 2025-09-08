//this table shows if there are any errors present in the rows that are parsed through, like with a missing weight
// or unknown material. if there are none, it prints a 'no validation issues' message

export default function ValidationTable({ errors }) {
    if (errors.length === 0) return <p>No validation issues</p>;
  
    return (
      <div>
        <h3>Validation Issues</h3>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Row</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err, idx) => (
              <tr key={idx}>
                <td>{err.row}</td>
                <td>{err.issues.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  