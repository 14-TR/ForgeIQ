import React, { useState } from "react";

const CentralTendencyPanel = ({ displayData }) => {
  const [computedStats, setComputedStats] = useState([]);

  // Helper to compute stats for a numeric array
  const computeStats = (numericValues) => {
    if (!numericValues.length) return null;

    // Mean
    const mean =
      numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;

    // Median
    const sorted = [...numericValues].sort((a, b) => a - b);
    let median;
    if (sorted.length % 2 === 0) {
      const midHigh = sorted.length / 2;
      const midLow = midHigh - 1;
      median = (sorted[midLow] + sorted[midHigh]) / 2;
    } else {
      const mid = Math.floor(sorted.length / 2);
      median = sorted[mid];
    }

    // Mode (simple approach)
    const counts = {};
    let maxCount = 0;
    let modeValue = null;
    for (const val of sorted) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        modeValue = val;
      }
    }

    // Return the object
    return {
      count: numericValues.length,
      mean,
      median,
      mode: modeValue,
    };
  };

  // Called on "GO" button click
  const handleCompute = () => {
    if (!displayData || displayData.length === 0) {
      alert("No data available for calculation!");
      return;
    }

    // Separate arrays: one for ACLED (fatalities), one for VIIRS (frp)
    const fatalitiesValues = displayData
      .filter((item) => typeof item.fatalities === "number" && !isNaN(item.fatalities))
      .map((item) => item.fatalities);

    const frpValues = displayData
      .filter((item) => typeof item.frp === "number" && !isNaN(item.frp))
      .map((item) => item.frp);

    const newStats = [];

    // 1) Compute stats for ACLED (fatalities), if present
    if (fatalitiesValues.length > 0) {
      const result = computeStats(fatalitiesValues);
      if (result) {
        newStats.push({
          field: "fatalities",
          ...result,
        });
      }
    }

    // 2) Compute stats for VIIRS (frp), if present
    if (frpValues.length > 0) {
      const result = computeStats(frpValues);
      if (result) {
        newStats.push({
          field: "frp",
          ...result,
        });
      }
    }

    // If neither array had anything, let user know
    if (newStats.length === 0) {
      alert("No valid numeric data (fatalities or frp) found!");
    }

    setComputedStats(newStats);
  };

  /* ---------- Styles ---------- */
  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "250px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
  };

  const buttonStyle = {
    marginTop: "8px",
    padding: "8px 15px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  };

  const tableContainerStyle = { marginTop: "16px" };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const headerCellStyle = { borderBottom: "1px solid #666", textAlign: "left" };
  const dataCellStyle = { padding: "4px 0" };

  return (
    <div style={panelStyles}>
      <h3>Central Tendency</h3>
      <p style={{ marginBottom: "10px" }}>
        Computes mean, median, and mode for:
        <br />• ACLED's <strong>fatalities</strong>
        <br />• VIIRS <strong>frp</strong>
        <br />
        (If both data sets are on the map, shows both results.)
      </p>

      <button style={buttonStyle} onClick={handleCompute}>
        GO
      </button>

      {/* Render results for each data type we found */}
      {computedStats.map((statsObj, index) => (
        <div key={index} style={tableContainerStyle}>
          <h4 style={{ marginBottom: "6px" }}>
            Central Tendency for <em>{statsObj.field}</em>
          </h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Measure</th>
                <th style={headerCellStyle}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={dataCellStyle}>Count</td>
                <td style={dataCellStyle}>{statsObj.count}</td>
              </tr>
              <tr>
                <td style={dataCellStyle}>Mean</td>
                <td style={dataCellStyle}>{statsObj.mean.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={dataCellStyle}>Median</td>
                <td style={dataCellStyle}>{statsObj.median.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={dataCellStyle}>Mode</td>
                <td style={dataCellStyle}>{statsObj.mode}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CentralTendencyPanel;
