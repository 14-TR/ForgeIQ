// InfoPage.jsx
import React from "react";

const InfoPage = () => {
  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "200px",
    maxWidth: "400px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)"
  };

  return (
    <div style={panelStyles}>
      <h3>Info Page</h3>
      <p style={{ marginTop: "6px" }}>
        This is some placeholder content forInfo sub-panel place
        helpful instructions, disclaimers, or any static content here.
      </p>
    </div>
  );
};

export default InfoPage;
