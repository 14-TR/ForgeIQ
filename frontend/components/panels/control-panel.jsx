import React from "react";

/**
 * A minimalist, dark-themed ControlPanel for adjusting DeckGL layer parameters.
 * This panel includes three sliders:
 * 1. radius        - The radius of each hex/bin in  layer
 * 2. coverage      - The coverage proportion for each hex/bin
 * 3. upperPercentile - The percentile that determines how many data points
 *                      get cut off from rendering
 */
const ControlPanel = ({
  radius,
  setRadius,
  coverage,
  setCoverage,
  upperPercentile,
  setUpperPercentile
}) => {
  // Handle user changes to the radius slider
  const handleRadiusChange = (e) => {
    setRadius(Number(e.target.value));
  };

  // Handle user changes to the coverage slider
  const handleCoverageChange = (e) => {
    setCoverage(Number(e.target.value));
  };

  // Handle user changes to the upperPercentile slider
  const handleUpperPercentileChange = (e) => {
    setUpperPercentile(Number(e.target.value));
  };

  return (
    <div style={styles.panelContainer}>
      <h3 style={styles.title}>Layer Controls</h3>

      {/* Radius slider */}
      <div style={styles.controlGroup}>
        <label htmlFor="radius">Radius:</label>
        <input
          id="radius"
          type="range"
          min="500"
          max="3000"
          step="100"
          value={radius}
          onChange={handleRadiusChange}
          style={styles.slider}
        />
        <span style={styles.value}>{radius}</span>
      </div>

      {/* Coverage slider */}
      <div style={styles.controlGroup}>
        <label htmlFor="coverage">Coverage:</label>
        <input
          id="coverage"
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={coverage}
          onChange={handleCoverageChange}
          style={styles.slider}
        />
        <span style={styles.value}>{coverage}</span>
      </div>

      {/* UpperPercentile slider */}
      <div style={styles.controlGroup}>
        <label htmlFor="percentile">Upper %:</label>
        <input
          id="percentile"
          type="range"
          min="0"
          max="100"
          step="5"
          value={upperPercentile}
          onChange={handleUpperPercentileChange}
          style={styles.slider}
        />
        <span style={styles.value}>{upperPercentile}</span>
      </div>
    </div>
  );
};

/**
 * Inline styles for the control panel.
 * dark gray background (#2c2c2c) to maintain a dark theme
 * apply a subtle drop shadow for a clean, minimalist look.
 */
const styles = {
  panelContainer: {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "4px",
    minWidth: "200px",
    fontFamily: "sans-serif",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "1.1rem",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
  },
  slider: {
    marginTop: "6px",
    width: "100%",
  },
  value: {
    marginTop: "4px",
    textAlign: "right",
    fontSize: "0.9rem",
    opacity: 0.8,
  },
};

export default ControlPanel;
