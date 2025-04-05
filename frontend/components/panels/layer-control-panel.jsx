// LayerControlPanel.jsx
import React, { useContext } from "react";
import { Box, Typography, Slider, FormControlLabel, Switch, Divider } from "@mui/material";

// Import context and actions
import { MapContext, ActionTypes } from "../../context/MapContext"; // Adjust path as needed

/**
 * Panel for adjusting layer parameters (radius, coverage)
 * and toggling layer visibility using context.
 */
// Removed props: radius, setRadius, coverage, setCoverage, show[Layer], setShow[Layer]
const LayerControlPanel = () => {
  // Get state and dispatch from context
  const { state, dispatch } = useContext(MapContext);
  const { radius, coverage, showBattlesLayer, showExplosionsLayer, showViirsLayer, showNlqLayer } = state;

  // Handlers dispatch actions
  const handleRadiusChange = (event, newValue) => {
    dispatch({ type: ActionTypes.SET_RADIUS, payload: newValue });
  };

  const handleCoverageChange = (event, newValue) => {
    dispatch({ type: ActionTypes.SET_COVERAGE, payload: newValue });
  };

  // Generic toggle handler
  const handleToggleLayer = (layerName, event) => {
      dispatch({ 
          type: ActionTypes.TOGGLE_LAYER, 
          payload: { layerName: layerName, isVisible: event.target.checked }
      });
  };

  return (
    <Box sx={{ 
        backgroundColor: "#2c2c2c",
        color: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
        minWidth: "240px",
        boxShadow: 3
    }}>
      <Typography variant="h6" gutterBottom component="h3">
        Layer Controls
      </Typography>

      {/* Radius Slider */}
      <Box sx={{ mb: 1 }}>
        <Typography gutterBottom variant="body2">Radius: {radius}m</Typography>
        <Slider
          aria-label="Radius"
          value={radius}
          onChange={handleRadiusChange}
          valueLabelDisplay="auto"
          step={100}
          min={100}
          max={5000} // Increased max radius
          size="small"
          sx={{ color: "#8884d8" }}
        />
      </Box>

      {/* Coverage Slider */}
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom variant="body2">Coverage: {coverage.toFixed(1)}</Typography>
        <Slider
          aria-label="Coverage"
          value={coverage}
          onChange={handleCoverageChange}
          valueLabelDisplay="auto"
          step={0.1}
          min={0.1}
          max={1.0}
          size="small"
          sx={{ color: "#8884d8" }}
        />
      </Box>

      <Divider sx={{ my: 2, borderColor: '#555' }} />

      {/* Layer Toggles */}
      <Typography variant="subtitle1" gutterBottom>Visibility</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormControlLabel
          control={
            <Switch 
              checked={showBattlesLayer}
              onChange={(e) => handleToggleLayer('battles', e)}
              size="small"
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#dc143c' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#dc143c' } }}
            />
          }
          label={<Typography variant="body2">Battles</Typography>}
        />
        <FormControlLabel
          control={
            <Switch 
              checked={showExplosionsLayer}
              onChange={(e) => handleToggleLayer('explosions', e)}
              size="small"
               sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff8c00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ff8c00' } }}
            />
          }
          label={<Typography variant="body2">Explosions</Typography>}
        />
        <FormControlLabel
          control={
            <Switch 
              checked={showViirsLayer}
              onChange={(e) => handleToggleLayer('viirs', e)}
              size="small"
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#228b22' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#228b22' } }}
            />
          }
          label={<Typography variant="body2">VIIRS</Typography>}
        />
         <FormControlLabel
          control={
            <Switch 
              checked={showNlqLayer}
              onChange={(e) => handleToggleLayer('nlq', e)} // Assuming 'nlq' corresponds to showNlqLayer
              size="small"
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#9370db' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#9370db' } }}
            />
          }
          label={<Typography variant="body2">NLQ Results</Typography>}
        />
      </Box>
    </Box>
  );
};

export default LayerControlPanel;
