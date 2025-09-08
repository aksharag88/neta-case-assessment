//this file is responsible for a lot of the frontend. it shows the upload box for the user to upload files, and then
// sends the file to the backend to be processed. after the backend processes the files, it shows an overview of the
// total fees and counts (vendors, SKUs, error rows), any validation issues, and a fee summary with the top 10 SKUs

import React, { useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import FileUploader from "./components/FileUploader";
import ValidationTable from "./components/ValidationTable";
import FeeSummary from "./components/FeeSummary";

export default function App() {
  const [data, setData] = useState(null);
  //error message if someting goes wrong
  const [error, setError] = useState(null);
  //loading message while data is processed 
  const [loading, setLoading] = useState(false);

  //this is called when a file is uploaded. it sends the file to the backend and works with the localhost 
  const handleUpload = async (files) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const formData = new FormData();
      for (let f of files) formData.append("files", f);

      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      //if the server's json can't be decoded, it throws an error
      const json = await res.json().catch(() => null);
      if (!json) throw new Error("Could not parse server response.");

      setData(json);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  //overview stats
  const ov = data?.overview || { vendors: 0, skus: 0, totalFees: 0, errorRows: 0 };

  return (
    <ErrorBoundary>
      <div className="container">
        <h1>Neta Packaging Compliance Case Assessment</h1>
        {/* this part handles the upload */}
        <FileUploader onUpload={handleUpload} />

        {/* status messages (loading, error)*/}
        {loading && <p>Processing…</p>}
        {error && <p style={{ color: "tomato" }}>{error}</p>}

        {/* displays the results after it is processed and sent back to frontend */}
        {data ? (
          <>
            <div className="card">
              <h2>Overview</h2>
              <p>Vendors: {ov.vendors ?? 0}</p>
              <p>SKUs: {ov.skus ?? 0}</p>
              <p>Total Fees: {(ov.totalFees ?? 0).toFixed(2)}¢</p>
              <p>Error Rows: {ov.errorRows ?? 0}</p>
            </div>

            <div className="card">
              <ValidationTable errors={data.errors || []} />
            </div>

            <div className="card">
              <FeeSummary summary={data.feeSummary || []} topSKUs={data.topSKUs || []} />
            </div>
          </>
        ) : (
          !loading && <p>No data loaded yet. Please upload a vendor submission file.</p>
        )}
      </div>
    </ErrorBoundary>
  );
}
