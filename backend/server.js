//this file is reponsible for the server. it reads the files and parses through them, checking for any errors, and
// also calculates the packaging fees. then it formats the results to the frontend

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { parseFiles } = require("./utils/parser");
const { validateData } = require("./utils/validator");
const { calculateFees } = require("./utils/fees");

//sets up the server using express and multer
const app = express();
const upload = multer({ dest: "uploads/" });

//connects with frontend on port 5173
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

//handles the upload: when a file is uploaded from frontend, this server will go through it and calculate the fees
//then the results are displayed on the frontend ui
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    console.log("Received upload:", req.files.map(f => f.originalname));
    
    //parsing and validating
    const vendorData = await parseFiles(req.files);
    console.log("Parsed rows:", vendorData.length);

    const { cleaned, errors, warnings } = validateData(vendorData);
    const fees = calculateFees(cleaned);

    //formats the results to send back
    res.json({
      overview: {
        vendors: new Set(cleaned.map(r => r.vendor_id)).size || 0,
        skus: new Set(cleaned.map(r => r.sku_id)).size || 0,
        totalFees: Number(fees.overall || 0),
        errorRows: errors.length || 0,
      },
      errors: errors || [],
      warnings: warnings || [],
      feeSummary: fees.summary || [],
      topSKUs: fees.topSKUs || [],
    });
    //error message
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(200).json({
      overview: { vendors: 0, skus: 0, totalFees: 0, errorRows: 0 },
      errors: [{ row: "-", issues: ["Server error: " + err.message] }],
      warnings: [],
      feeSummary: [],
      topSKUs: [],
    });
  }
});

//prints server running to terminal
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
