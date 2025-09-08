//this file is responsible for reading the vendor files (both csv and excel). it also cleans up the data a little
// bit, like getting rid of unnecessary spaces, unit consistency, and conversions

const fs = require("fs");
const csv = require("csv-parse/sync");
const XLSX = require("xlsx");

//this makes all the rows consistent
function normalizeRow(raw) {
  const row = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k || "").trim();
    row[key] = typeof v === "string" ? v.trim() : v;
  }

  const get = (names) => {
    for (const n of names) {
      if (row[n] !== undefined) return row[n];
      const hit = Object.keys(row).find((rk) => rk.toLowerCase() === n.toLowerCase());
      if (hit) return row[hit];
    }
    return undefined;
  };

  //reads and fixes up fields
  const quantity_basis = String(get(["quantity_basis"]) || "").toLowerCase();
  const weight_unit = String(get(["weight_unit"]) || "").toLowerCase();
  const weight_value = get(["weight_value"]);
  const case_size = get(["case_size"]);

  //sets the guidelines for the rest of the data to improve consistency
  return {
    vendor_id: get(["vendor_id"]),
    sku_id: get(["sku_id"]),
    component: get(["component"]),
    material_name: get(["material_name"]),
    material_category: get(["material_category", "category_group"]),
    weight_value: weight_value === "" || weight_value == null ? null : Number(weight_value),
    weight_unit: weight_unit === "grams" ? "g" : weight_unit,
    quantity_basis: quantity_basis === "case" ? "case" : "unit",
    case_size: case_size === "" || case_size == null ? null : Number(case_size),
    notes: get(["notes"]),
  };
}

//this handles the parsing: is it's a csv file, it gets rid of the byte order marks, and if it's excel, it reads it
// into json form. then, the data is passed through the normalizeRow function from earlier to fix it up 
async function parseFiles(files) {
  let allRows = [];

  for (let file of files) {
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (ext === "csv") {
      //BOM stuff
      let content = fs.readFileSync(file.path);
      if (content[0] === 0xef && content[1] === 0xbb && content[2] === 0xbf) {
        content = content.slice(3);
      }
      const text = content.toString("utf8");
      const rows = csv.parse(text, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });
      allRows = allRows.concat(rows.map(normalizeRow));
    } else if (ext === "xlsx") {
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      allRows = allRows.concat(rows.map(normalizeRow));
    }
  }

  //any empty lines are filtered out 
  allRows = allRows.filter(
    (r) => r.vendor_id || r.sku_id || r.component || r.material_name || r.weight_value
  );

  return allRows;
}

module.exports = { parseFiles };
