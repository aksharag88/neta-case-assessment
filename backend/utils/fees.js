//this file is responsible for calculating the packagin fees of the data. it checks the fee rate (as well as discounts),
// and then multiplies that with the weight. then it adds it all up by SKU and the vendor. the result is the totals,
// the top SKUs, and the total fee

const fs = require("fs");
const csv = require("csv-parse/sync");
const path = require("path");

//loads fees from csv
const baseDir = path.resolve(__dirname, "../../");
const feesTable = csv.parse(fs.readFileSync(path.join(baseDir, "fees.csv")), { columns: true });
//material lookup
const feeByMaterial = new Map(feesTable.map(f => [String(f.material_name).trim(), f]));

function calculateFees(rows) {
  const totalsBySku = new Map();

  //fee calculation by row 
  for (const r of rows) {
    const fr = feeByMaterial.get(String(r.material_name).trim());
    if (!fr) continue;

    const discount = parseFloat(fr.eco_modulation_discount || 0) || 0;
    const feePerGram = parseFloat(fr.fee_cents_per_gram || 0) || 0;
    const grams = parseFloat(r.grams || 0) || 0;

    //calculates the fee including the discount
    const fee = feePerGram * grams * (1 - discount);

    //uses SKU to group it 
    const key = r.sku_id || "UNKNOWN";
    if (!totalsBySku.has(key)) {
      totalsBySku.set(key, {
        sku_id: r.sku_id || "UNKNOWN",
        vendor_id: r.vendor_id || "UNKNOWN",
        grams: 0,
        total: 0,
      });
    }
    //adds the weight and fee to the total
    const acc = totalsBySku.get(key);
    acc.grams += grams;
    acc.total += fee;
  }

  //this handles the output
  const summary = Array.from(totalsBySku.values());
  const topSKUs = [...summary].sort((a, b) => b.total - a.total).slice(0, 10);
  const overall = summary.reduce((sum, s) => sum + (s.total || 0), 0);

  return { summary, topSKUs, overall };
}

module.exports = { calculateFees };
