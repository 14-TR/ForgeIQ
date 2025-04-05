import React, { useState, useContext, useMemo } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

// Import context
import { MapContext } from "../../context/MapContext"; // Adjust path as needed

/**
 * Panel to compute and display central tendency measures (mean, median, mode)
 * for specific numeric fields ('fatalities', 'frp') within the active data set from context.
 */
// Removed props: displayData, dataSource
const CentralTendencyPanel = () => {
  // Get state from context
  const { state } = useContext(MapContext);
  const { activeData } = state; // Use activeData from context

  // Local state to hold the computed results
  const [computedStats, setComputedStats] = useState([]);

  // --- Calculation Logic --- (Memoized or kept as helper)
  const computeStats = (numericValues) => {
    if (!numericValues || numericValues.length === 0) return null;

    const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;

    const sorted = [...numericValues].sort((a, b) => a - b);
    let median;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Mode calculation (simple)
    const counts = {};
    let maxCount = 0;
    let modeValue = null;
    let multipleModes = false;
    for (const val of sorted) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        modeValue = val;
        multipleModes = false; // Reset if a new max is found
      } else if (counts[val] === maxCount && val !== modeValue) {
        multipleModes = true; // Found another value with the same max count
      }
    }
    // If all values are unique or multiple modes exist with the same highest count, mode is less meaningful
    const finalMode = maxCount <= 1 || multipleModes ? "N/A" : modeValue;

    return {
      count: numericValues.length,
      mean: mean,
      median: median,
      mode: finalMode, // Use potentially updated mode value
    };
  };

  // --- Trigger Computation --- 
  const handleCompute = () => {
    if (!activeData || activeData.length === 0) {
      setComputedStats([]); // Clear stats if no data
      // Optionally show a message to the user
      return;
    }

    const newStats = [];
    const fieldsToAnalyze = [
      { key: 'fatalities', label: 'Fatalities (ACLED)' },
      { key: 'frp', label: 'Fire Radiative Power (VIIRS)' },
      // Add more fields here if needed, e.g., { key: 'brightness', label: 'Brightness (VIIRS)' }
    ];

    fieldsToAnalyze.forEach(({ key, label }) => {
        const values = activeData
            .map(item => item ? Number(item[key]) : NaN) // Get value, convert to number
            .filter(val => !isNaN(val)); // Filter out NaN values

        if (values.length > 0) {
            const result = computeStats(values);
            if (result) {
                newStats.push({ field: label, ...result });
            }
        }
    });

    setComputedStats(newStats);
    // Optionally add user feedback if no valid data found for any field
     if (newStats.length === 0) {
         console.warn("CentralTendency: No valid numeric data found for analyzed fields in the active dataset.");
     }
  };

  // --- Render Logic --- 
  return (
    <Box sx={{ 
        backgroundColor: "#2c2c2c",
        color: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
        minWidth: "280px",
        maxWidth: "400px",
        boxShadow: 3 
    }}>
      <Typography variant="h6" gutterBottom component="h3">
        Central Tendency
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Computes Mean, Median, and Mode for numeric fields in the current view.
      </Typography>

      <Button 
        variant="contained" 
        onClick={handleCompute}
        disabled={!activeData || activeData.length === 0} // Disable if no data
        size="small"
        sx={{ 
            backgroundColor: '#555',
            '&:hover': { backgroundColor: '#666' }
        }}
       >
        Calculate for Current View
      </Button>

      {/* Render results tables */}
      {computedStats.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {computedStats.map((statsObj, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom component="h4">
                 {statsObj.field}
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: '#333' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                       <TableCell sx={{ color: '#eee', fontWeight: 'bold', borderBottomColor: '#555' }}>Measure</TableCell>
                       <TableCell align="right" sx={{ color: '#eee', fontWeight: 'bold', borderBottomColor: '#555' }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc', border: 0 }}>Count</TableCell>
                      <TableCell align="right" sx={{ color: '#ccc', border: 0 }}>{statsObj.count}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc', border: 0 }}>Mean</TableCell>
                      <TableCell align="right" sx={{ color: '#ccc', border: 0 }}>{statsObj.mean.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc', border: 0 }}>Median</TableCell>
                      <TableCell align="right" sx={{ color: '#ccc', border: 0 }}>{statsObj.median.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc', border: 0 }}>Mode</TableCell>
                      <TableCell align="right" sx={{ color: '#ccc', border: 0 }}>{statsObj.mode}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}
       {computedStats.length === 0 && (
           <Typography variant="body2" sx={{ mt: 2, color: '#aaa' }}>
               Click 'Calculate' to see stats for the current data view.
           </Typography>
       )}
    </Box>
  );
};

export default CentralTendencyPanel;
