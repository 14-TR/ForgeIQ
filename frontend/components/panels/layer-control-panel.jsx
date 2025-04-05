// LayerControlPanel.jsx
import React from "react";

/**
 * Minimalist, dark-themed panel for adjusting layer parameters
 * or toggling layer visibility.
 */
const LayerControlPanel = ({
  radius,
  setRadius,
  coverage,
  setCoverage,
  
  showBattlesLayer,
  setShowBattlesLayer,
  showExplosionsLayer,
  setShowExplosionsLayer,
  showViirsLayer,
  setShowViirsLayer,
}) => {
  // Example slider handlers
  const handleRadiusChange = (e) => setRadius(Number(e.target.value));
  const handleCoverageChange = (e) => setCoverage(Number(e.target.value));

  // Example toggles for layers
  const toggleBattles = () => setShowBattlesLayer(!showBattlesLayer);
  const toggleExplosions = () => setShowExplosionsLayer(!showExplosionsLayer);
  const toggleViirs = () => setShowViirsLayer(!showViirsLayer);

  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "200px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
  };

  return (
    <div style={panelStyles}>
      <h3>Layer Controls</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Radius:</label>
        <input
          type="range"
          min="100"
          max="3000"
          step="100"
          value={radius}
          onChange={handleRadiusChange}
        />
        <span> {radius}</span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Coverage:</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={coverage}
          onChange={handleCoverageChange}
        />
        <span> {coverage}</span>
      </div>

      <hr style={{ margin: "10px 0" }} />

      {/* Simple checkboxes or toggles for layer visibility */}
      <div style={{ marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={showBattlesLayer}
          onChange={toggleBattles}
          id="battles-chk"
        />
        <label htmlFor="battles-chk" style={{ marginLeft: "4px" }}>
          Battles Layer
        </label>
      </div>

      <div style={{ marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={showExplosionsLayer}
          onChange={toggleExplosions}
          id="explosions-chk"
        />
        <label htmlFor="explosions-chk" style={{ marginLeft: "4px" }}>
          Explosions Layer
        </label>
      </div>

      <div style={{ marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={showViirsLayer}
          onChange={toggleViirs}
          id="viirs-chk"
        />
        <label htmlFor="viirs-chk" style={{ marginLeft: "4px" }}>
          VIIRS Layer
        </label>
      </div>
    </div>
  );
};

export default LayerControlPanel;
