// SearchAggregationPanel.jsx
import React, { useContext } from "react";
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";

// Import context and actions
import { MapContext, ActionTypes } from "../../context/MapContext";

// Import NLQ hook
import { useNlqHandler } from "../../hooks/use-nlq-handler.js";

// Corrected path for NlqSearchBar
import NlqSearchBar from "../nlq/nlq-search-bar.jsx";

/**
 * This panel includes:
 *  - The NLQ search bar (uses hook for submission)
 *  - The "Reset" button (dispatches action)
 *  - The aggregated results table (reads from context)
 */
const SearchAggregationPanel = () => {
  // Get state and dispatch from context
  const { state, dispatch } = useContext(MapContext);
  const { statsData, nlqLoading, nlqError } = state;

  // Initialize the NLQ hook with dispatch
  const { fetchNlqResults } = useNlqHandler(dispatch);

  // Handle search submission by calling the hook function
  const handleSearch = (query) => {
    if (query.trim()) {
      fetchNlqResults(query);
    }
  };

  // Handle reset by dispatching action
  const handleReset = () => {
    dispatch({ type: ActionTypes.CLEAR_NLQ_RESULTS });
  };

  // Render aggregated results table using MUI
  const renderStatsTable = () => {
    if (!statsData || statsData.length === 0) return null;

    const headers = Object.keys(statsData[0]);

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom component="h4">
          Aggregated Results
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300, backgroundColor: '#333' }}> 
          <Table stickyHeader size="small" aria-label="aggregated results table">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header} sx={{ backgroundColor: '#444', color: '#fff', fontWeight: 'bold' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {statsData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header) => (
                    <TableCell key={`${rowIndex}-${header}`} sx={{ color: '#f5f5f5', borderBottom: '1px solid #555' }}>
                      {typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ 
        backgroundColor: "#2c2c2c",
        padding: "16px",
        borderRadius: "8px",
        color: "#fff",
        minWidth: "350px", 
        maxWidth: "500px",
        boxShadow: 3 
    }}>
      <Typography variant="h6" gutterBottom component="h3">
        Search & Aggregation
      </Typography>
      
      {/* NlqSearchBar now receives handleSearch callback */}
      <NlqSearchBar 
        onQuerySubmit={handleSearch} 
      />

      {/* Display Loading/Error related to NLQ */} 
       {nlqLoading && (
         <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#aaa' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
            <Typography variant="body2">Processing query...</Typography>
         </Box>
       )}
       {nlqError && (
         <Typography variant="body2" color="error" sx={{ mt: 1 }}>
           Error: {nlqError}
         </Typography>
       )}

      {/* Reset Button */}
      <Button
        variant="contained"
        onClick={handleReset}
        size="small"
        sx={{ 
            mt: 1,
            backgroundColor: '#555',
            '&:hover': { backgroundColor: '#666' }
        }}
      >
        Reset Search
      </Button>

      {/* Render aggregated results table */}
      {renderStatsTable()}
    </Box>
  );
};

export default SearchAggregationPanel;
