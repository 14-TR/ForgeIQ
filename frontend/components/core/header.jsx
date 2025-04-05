import React from "react";

const Header = () => {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "5vh",
        width: "100%",
        backgroundColor: "#2c2c2c",
        color: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        zIndex: 1000,
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.2rem" }}>
        ConflictIQ | Designed by TR
      </h1>
      {/* Uncomment this if you have an InfoButton component */}
      {/* <InfoButton /> */}
    </header>
  );
};

export default Header;
