//this file is responsible for validating the data gathered from the vendor files. it just checks some of the elements
// of the files, like units, weights, and materials. then, we see which rows are clean, have errors, or have warnings

const fs = require("fs");
const csv = require("csv-parse/sync");
const path = require("path");

//materials, products, vendors
const baseDir = path.resolve(__dirname, "../../");
const materials = csv.parse(fs.readFileSync(path.join(baseDir, "materials.csv")), { columns: true });
const products  = csv.parse(fs.readFileSync(path.join(baseDir, "products.csv")),  { columns: true });
const vendors   = csv.parse(fs.readFileSync(path.join(baseDir, "vendors.csv")),   { columns: true });

//checks if material is valid 
const matByName = new Map(materials.map(m => [String(m.material_name).trim(), m]));
const productBySku = new Map(products.map(p => [String(p.sku_id).trim(), p]));
const vendorById = new Map(vendors.map(v => [String(v.vendor_id).trim(), v]));

function validateData(rows) {
  const errors = [];
  const warnings = [];
  const cleaned = [];

  rows.forEach((row, idx) => {
    const issues = [];

    //product and vendor names
    const prod = row.sku_id ? productBySku.get(String(row.sku_id).trim()) : null;
    const ven  = row.vendor_id ? vendorById.get(String(row.vendor_id).trim()) : null;

    //unit validation
    let grams = null;
    const unit = (row.weight_unit || "").toLowerCase();
    const wv = row.weight_value;

    //converts the weight to grams 
    if (wv == null || isNaN(Number(wv))) {
      issues.push("Missing or invalid weight");
    } else if (unit === "oz") {
      grams = Number(wv) * 28.3495;
    } else if (unit === "g") {
      grams = Number(wv);
    } else if (unit === "") {
      issues.push("Missing unit");
    } else {
      issues.push("Invalid unit");
    }

    //if the weight was given by case, convert
    if (row.quantity_basis === "case") {
      if (!row.case_size || isNaN(Number(row.case_size)) || Number(row.case_size) <= 0) {
        issues.push("Case basis without valid case_size");
      } else if (grams != null) {
        grams = grams / Number(row.case_size);
      }
    }

    //checks the material name
    const mat = row.material_name ? matByName.get(String(row.material_name).trim()) : null;
    if (!mat) issues.push("Invalid material name");

    //checks for outlier (error handling)
    if (grams != null && grams > 300) {
      warnings.push({ row: idx + 1, issue: "Outlier weight > 300g" });
    }

    //checks for issues. if there is an issue, it marks the row as unusable 
    if (issues.length > 0) {
      errors.push({ row: idx + 1, issues });
    } 
    //if a row has not problems, it's considered clean
    else {
      cleaned.push({
        vendor_id: row.vendor_id || (prod?.vendor_id ?? "UNKNOWN"),
        vendor_name: ven?.vendor_name || "UNKNOWN",
        sku_id: row.sku_id || "UNKNOWN",
        sku_name: prod?.sku_name || "UNKNOWN",
        component: row.component || "",
        material_name: row.material_name || "",
        grams: grams ?? 0,
      });
    }
  });

  return { cleaned, errors, warnings };
}

module.exports = { validateData };
