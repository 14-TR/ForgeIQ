import React, { useContext, useMemo } from "react";
import { Box, Typography, Slider, FormControlLabel, Switch, Divider, Paper, IconButton } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { Rnd } from "react-rnd";
import CloseIcon from "@mui/icons-material/Close";

// Import context and actions
import { MapContext, ActionTypes } from "../../context/MapContext";  // Get both from MapContext

/**
 * Panel for analysis controls (brushing, chart visibility)
 * Displays a time series chart based on active data from context.
 */
const AnalysisControlPanel = () => {
  // Get state and dispatch from context
  const { state, dispatch } = useContext(MapContext);
  const { 
      brushingEnabled, 
      brushingRadius, 
      showChart, 
      activeData, // Use activeData from context for the chart
      layerInfo // Use layerInfo from context for chart styling
  } = state;

  console.log(
    "AnalysisControlPanel: Rendering.", 
    { showChart, brushingEnabled }, 
    "Active data received (first 5):", activeData?.slice(0, 5) // Log first 5 items
  ); 

  // --- Handlers --- (Dispatch actions)
  const handleToggleBrushing = (event) => {
    dispatch({ type: ActionTypes.SET_BRUSHING_ENABLED, payload: event.target.checked });
  };

  const handleRadiusChange = (event, newValue) => {
    dispatch({ type: ActionTypes.SET_BRUSHING_RADIUS, payload: newValue });
  };

  const handleToggleChart = (event) => {
    dispatch({ type: ActionTypes.SET_SHOW_CHART, payload: event.target.checked });
  };

  // --- Chart Data Preparation --- (Memoized)
  const chartData = useMemo(() => {
    console.log("AnalysisControlPanel: useMemo START. activeData length:", activeData?.length); 
    if (!activeData || activeData.length === 0) {
        console.log("AnalysisControlPanel: useMemo - activeData is empty.");
        return [];
    }
    
    console.time('Prepare Chart Data');
    const dateCounts = {};
    let datesProcessed = new Set(); // Keep track of unique dates found
    activeData.forEach((item) => {
      if (item && item.event_date) {
        try {
            const dateStr = new Date(item.event_date).toISOString().slice(0, 10);
            datesProcessed.add(dateStr); // Add date to the Set
            const eventType = String(item.event_type || '').toLowerCase();

            if (!dateCounts[dateStr]) {
                dateCounts[dateStr] = { date: dateStr, battles: 0, explosions: 0, viirs: 0, nlq: 0, total: 0 };
            }

            let counted = false;
            if (eventType === 'battle' || eventType === 'battles') {
                dateCounts[dateStr].battles += 1;
                counted = true;
            } else if (eventType === 'explosion' || eventType === 'explosions') {
                dateCounts[dateStr].explosions += 1;
                counted = true;
            } else if (eventType === 'viirs') {
                dateCounts[dateStr].viirs += 1;
                counted = true;
            } else if (eventType === 'nlq_result') { // Count NLQ results separately
                 dateCounts[dateStr].nlq += 1;
                 counted = true;
            }
            
            if(counted) {
                 dateCounts[dateStr].total += 1; // Increment total only if it belongs to a tracked type
            }
        } catch (e) {
            // Ignore items with invalid dates
            // console.warn(`Invalid date format for charting: ${item.event_date}`, e);
        }
      }
    });
    const sortedData = Object.values(dateCounts).sort((a, b) => a.date.localeCompare(b.date));
    console.log("AnalysisControlPanel: Dates processed in useMemo:", Array.from(datesProcessed)); // Log unique dates found
    console.log("AnalysisControlPanel: Calculated dateCounts object:", dateCounts); // Log the intermediate counts
    console.log("AnalysisControlPanel: useMemo END. Final sorted chartData:", sortedData); 
    console.timeEnd('Prepare Chart Data');
    return sortedData;
  }, [activeData]);

  // --- Chart Styling --- (Based on layerInfo from context)
  const battleColor = useMemo(() => layerInfo.battles?.color || "#dc143c", [layerInfo.battles]);
  const explosionColor = useMemo(() => layerInfo.explosions?.color || "#ff8c00", [layerInfo.explosions]);
  const viirsColor = useMemo(() => layerInfo.viirs?.color || "#228b22", [layerInfo.viirs]);
  const nlqColor = useMemo(() => layerInfo.nlq_results?.color || "#9370db", [layerInfo.nlq_results]); // Color for NLQ
  const totalColor = useMemo(() => "#4169E1", []); // Royal blue for total

  const showBattlesLine = useMemo(() => state.showBattlesLayer, [state.showBattlesLayer]);
  const showExplosionsLine = useMemo(() => state.showExplosionsLayer, [state.showExplosionsLayer]);
  const showViirsLine = useMemo(() => state.showViirsLayer, [state.showViirsLayer]);
  const showNlqLine = useMemo(() => state.showNlqLayer, [state.showNlqLayer]); // Control NLQ line visibility

  return (
    <> {/* Use Fragment as Rnd chart is positioned absolutely outside the panel flow */}
      {/* Control Panel Box */}
      <Box sx={{ 
          backgroundColor: "#2c2c2c",
          color: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "250px",
          boxShadow: 3
      }}>
        <Typography variant="h6" gutterBottom component="h3">
          Analysis Controls
        </Typography>

        {/* Brushing Toggle */}
        <FormControlLabel
          control={
            <Switch 
              checked={brushingEnabled}
              onChange={handleToggleBrushing}
              size="small"
            />
          }
          label={<Typography variant="body2">Enable Brushing</Typography>}
          sx={{ mb: 1 }}
        />

        {/* Brushing Radius Slider */}
        <Box sx={{ mb: 2, opacity: brushingEnabled ? 1 : 0.5 }}>
          <Typography gutterBottom variant="body2">Brushing Radius: {brushingRadius}m</Typography>
          <Slider
            aria-label="Brushing Radius"
            value={brushingRadius}
            onChange={handleRadiusChange}
            valueLabelDisplay="auto"
            step={100}
            min={100}
            max={10000}
            size="small"
            disabled={!brushingEnabled}
            sx={{ color: "#8884d8" }}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: '#555' }} />

        {/* Show Chart Toggle */}
        <FormControlLabel
          control={
            <Switch 
              checked={showChart}
              onChange={handleToggleChart}
              size="small"
            />
          }
          label={<Typography variant="body2">Show Time Series Chart</Typography>}
        />
      </Box>

       {/* Resizable Chart Window (Positioned absolutely) */}
      {console.log("AnalysisControlPanel: Checking condition to render Rnd. showChart:", showChart)} {/* Log before Rnd */}
      {showChart && (
        <Rnd
          // disableDragging={true} // Allow dragging
          enableResizing={{
            top: true, right: true, bottom: true, left: true,
            topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
          }}
          default={{
            x: window.innerWidth * 0.5, // Start somewhat centered horizontally
            y: window.innerHeight - 450, // Start near bottom
            width: 600,
            height: 400,
          }}
          minWidth={300}
          minHeight={250}
          bounds="window" // Keep within window bounds
          style={{
            // position: "absolute", // Rnd handles positioning
            backgroundColor: "rgba(44, 44, 44, 0.95)", // Darker background
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            border: "1px solid #555",
            zIndex: 1200, // Ensure it's above most other elements
          }}
        >
          <Paper sx={{ width: "100%", height: "100%", padding: "16px", boxSizing: 'border-box', backgroundColor: 'transparent', color: '#f5f5f5', overflow:'hidden' }} elevation={0}>
            <IconButton 
              onClick={() => dispatch({ type: ActionTypes.SET_SHOW_CHART, payload: false })}
              sx={{ 
                position: "absolute", top: 4, right: 4, zIndex: 1, 
                color: '#aaa', backgroundColor: 'rgba(0,0,0,0.2)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.4)' }
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            
             <Typography variant="subtitle1" align="center" gutterBottom sx={{ color: '#eee', mt: -1, mb: 1 }}>
                 Event Time Series
              </Typography>
             {console.log("AnalysisControlPanel: Checking condition to render chart. chartData length:", chartData?.length)} {/* Log before chart */}
             {chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="calc(100% - 40px)"> 
                 <LineChart data={chartData} margin={{ top: 5, right: 25, bottom: 45, left: 10 }}>
                   <CartesianGrid stroke="#666" strokeDasharray="3 3" />
                   <XAxis 
                     dataKey="date" 
                     angle={-45} 
                     textAnchor="end" 
                     height={60}
                     tick={{ fontSize: 10, fill: '#ccc' }}
                     stroke="#aaa"
                   >
                    {/* <Label value="Date" position="insideBottom" offset={-15} /> */}
                   </XAxis>
                   <YAxis tick={{ fontSize: 10, fill: '#ccc' }} stroke="#aaa">
                     <Label value="Event Count" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#ccc' }} />
                   </YAxis>
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555'}} 
                      labelStyle={{ color: '#eee' }} 
                      itemStyle={{ fontSize: '0.8em' }}
                    />
                   <Legend wrapperStyle={{ fontSize: '0.8em', paddingTop: '10px' }} />
                   {/* Conditionally render lines based on context state */}
                   {showBattlesLine && <Line type="monotone" dataKey="battles" stroke={battleColor} name="Battles" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />} 
                   {showExplosionsLine && <Line type="monotone" dataKey="explosions" stroke={explosionColor} name="Explosions" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />}
                   {showViirsLine && <Line type="monotone" dataKey="viirs" stroke={viirsColor} name="VIIRS" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />}
                   {showNlqLine && <Line type="monotone" dataKey="nlq" stroke={nlqColor} name="NLQ" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />}
                   <Line type="monotone" dataKey="total" stroke={totalColor} name="Total" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
                  <Typography variant="body2" align="center" sx={{ color: '#aaa', mt: 4 }}>
                     No data available for the current filter.
                 </Typography>
             )}
          </Paper>
        </Rnd>
      )}
    </> 
  );
};

export default AnalysisControlPanel;
