//this file is reponsible for the ui of showing a summary of the total grams and fee for each SKU, as well as the top
// 10 list of SKUs (by fee). if there are none to show, it shows a different message

export default function FeeSummary({ summary, topSKUs }) {
    if (!summary || summary.length === 0) return <p>No fee data available.</p>;
  
    return (
      <div>
        <h3>Fee Summary</h3>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Vendor</th>
              <th>Grams</th>
              <th>Total Fee (¢)</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row, idx) => (
              <tr key={idx}>
                <td>{row.sku_id || "N/A"}</td>
                <td>{row.vendor_id || "N/A"}</td>
                <td>{row.grams !== undefined ? row.grams.toFixed(2) : "0.00"}</td>
                <td>{row.total !== undefined ? row.total.toFixed(2) : "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <h4>Top 10 SKUs by Fee</h4>
        {topSKUs && topSKUs.length > 0 ? (
          <ul>
            {topSKUs.map((sku, idx) => (
              <li key={idx}>
                {sku.sku_id || "N/A"} — {(sku.total || 0).toFixed(2)}¢
              </li>
            ))}
          </ul>
        ) : (
          <p>No SKUs available</p>
        )}
      </div>
    );
  }
  