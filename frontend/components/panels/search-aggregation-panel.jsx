// SearchAggregationPanel.jsx
import React from "react";
import NlqSearchBar from "./nlq-search-bar";

/**
 * This panel includes:
 *  - The NLQ search bar
 *  - The "Reset" button
 *  - The aggregated results table (if any)
 */
const SearchAggregationPanel = ({
  onQuerySubmit,
  onReset,
  statsData,
  nlqLoading = false,
  nlqError = null
}) => {
  // Some minimal styling
  const panelStyles = {
    backgroundColor: "#2c2c2c",
    padding: "10px",
    borderRadius: "8px",
    color: "#fff",
    minWidth: "300px",
  };

  // Table styling for aggregated results
  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  };
  const headerCellStyles = {
    backgroundColor: "#444",
    color: "#fff",
    padding: "8px",
    fontWeight: "bold",
    borderBottom: "1px solid #666",
  };
  const cellStyles = {
    padding: "8px",
    borderBottom: "1px solid #666",
    textAlign: "center",
    color: "#f5f5f5",
  };

  return (
    <div style={panelStyles}>
      <h3>Search & Aggregation</h3>
      {/* The NLQ Search Bar */}
      <NlqSearchBar 
        onQuerySubmit={onQuerySubmit} 
        loading={nlqLoading}
        error={nlqError}
      />

      {/* The reset button */}
      <button
        onClick={onReset}
        style={{
          marginTop: "8px",
          padding: "8px 15px",
          fontSize: "1rem",
          cursor: "pointer",
          backgroundColor: "#444",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Reset
      </button>

      {/* If there's aggregated data, show it in a table */}
      {statsData.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <h4>NLQ Aggregated Results</h4>
          <table style={tableStyles}>
            <thead>
              <tr>
                {Object.keys(statsData[0]).map((colKey) => (
                  <th key={colKey} style={headerCellStyles}>
                    {colKey}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statsData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(row).map((colKey) => (
                    <td key={colKey} style={cellStyles}>
                      {row[colKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchAggregationPanel;
