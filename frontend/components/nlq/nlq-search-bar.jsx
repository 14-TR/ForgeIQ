// nlq-search-bar.jsx
import React, { useState } from "react";

const NlqSearchBar = ({ onQuerySubmit, loading = false, error = null }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onQuerySubmit(query);
    // Don't clear input to allow for query refinement
    // setQuery(""); 
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: "10px", display: "flex" }}>
        <input
          type="text"
          placeholder="Ask about conflict events (e.g. 'Show me battles in Kyiv')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ 
            flex: 1, 
            padding: "8px", 
            fontSize: "1rem",
            backgroundColor: loading ? "#f0f0f0" : "white",
            color: "#000000",
            opacity: loading ? 0.7 : 1,
            border: "1px solid #ccc",
            borderRadius: "4px 0 0 4px"
          }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{ 
            padding: "8px 15px", 
            fontSize: "1rem", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: loading ? "#aaa" : "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "0 4px 4px 0"
          }}
          disabled={loading || !query.trim()}
        >
          {loading ? "Processing..." : "Search"}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          color: "#e74c3c", 
          fontSize: "0.9rem", 
          marginLeft: "10px",
          marginTop: "5px"
        }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ 
        fontSize: "0.8rem", 
        color: "#888", 
        margin: "5px 10px",
        fontStyle: "italic"
      }}>
        Example queries: "Show battles in 2022", "Count explosions by country", "Average fatalities in Ukraine"
      </div>
    </div>
  );
};

export default NlqSearchBar;
