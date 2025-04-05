import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from "recharts";
import { Rnd } from "react-rnd";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const AnalysisControlPanel = ({
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showChart,
  setShowChart,
  displayData,
  layerInfo = {} // Default empty object if not provided
}) => {
  const toggleBrushing = () => setBrushingEnabled(!brushingEnabled);
  const handleRadiusChange = (e) => setBrushingRadius(Number(e.target.value));
  const toggleChart = () => setShowChart(!showChart);

  // Default colors if layerInfo is not provided
  const battleColor = layerInfo.battles?.color || "#8B0000"; // Dark red
  const explosionColor = layerInfo.explosions?.color || "#FF8C00"; // Dark orange
  const viirsColor = layerInfo.viirs?.color || "#228B22"; // Forest green
  const totalColor = "#4169E1"; // Royal blue
  
  // Layer visibility from layer info (or default to true if not provided)
  const showBattlesLayer = layerInfo.battles?.visible !== undefined ? layerInfo.battles.visible : true;
  const showExplosionsLayer = layerInfo.explosions?.visible !== undefined ? layerInfo.explosions.visible : true;
  const showViirsLayer = layerInfo.viirs?.visible !== undefined ? layerInfo.viirs.visible : true;

  // Prepare chart data with separate counts for each event type
  let chartData = [];
  if (displayData && displayData.length > 0) {
    const dateCounts = {};
    
    displayData.forEach((item) => {
      if (item.event_date) {
        const dateStr = item.event_date.slice(0, 10);
        const eventType = String(item.event_type || '').toLowerCase();
        
        if (!dateCounts[dateStr]) {
          dateCounts[dateStr] = {
            date: dateStr,
            battles: 0,
            explosions: 0,
            viirs: 0,
            total: 0
          };
        }
        
        // Increment the appropriate event type counter
        if (eventType === 'battle' || eventType === 'battles') {
          dateCounts[dateStr].battles += 1;
          dateCounts[dateStr].total += 1; // Only count supported types in total
        } else if (eventType === 'explosion' || eventType === 'explosions') {
          dateCounts[dateStr].explosions += 1;
          dateCounts[dateStr].total += 1; // Only count supported types in total
        } else if (eventType === 'viirs') {
          dateCounts[dateStr].viirs += 1;
          dateCounts[dateStr].total += 1; // Only count supported types in total
        }
        // Other event types are ignored and not counted
      }
    });

    chartData = Object.values(dateCounts)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  const panelStyles = {
    backgroundColor: "#2c2c2c",
    color: "#f5f5f5",
    padding: "12px",
    borderRadius: "8px",
    minWidth: "250px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
  };

  return (
    <div style={panelStyles}>
      <h3>Analysis Controls</h3>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={brushingEnabled}
          onChange={toggleBrushing}
          id="brushing-chk"
        />
        <label htmlFor="brushing-chk" style={{ marginLeft: "4px" }}>
          Enable Brushing
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Brushing Radius: </label>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={brushingRadius}
          onChange={handleRadiusChange}
        />
        <span> {brushingRadius}</span>
      </div>

      <hr style={{ margin: "10px 0" }} />

      <div style={{ marginBottom: "6px" }}>
        <input
          type="checkbox"
          checked={showChart}
          onChange={toggleChart}
          id="chart-chk"
        />
        <label htmlFor="chart-chk" style={{ marginLeft: "4px" }}>
          Show Time Series Chart
        </label>
      </div>

      {showChart && chartData.length > 0 && (
        
        <Rnd
          disableDragging={true}
          enableResizing={{
            top: true, right: true, bottom: true, left: true,
            topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
          }}
          default={{
            width: 600,
            height: 400,
          }}
          style={{
            position: "absolute",
            bottom: "5vh",
            right: "5vw",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <IconButton 
              onClick={() => setShowChart(false)}
              style={{ 
                position: "absolute", 
                top: 0, 
                right: 0, 
                zIndex: 1001,
                backgroundColor: "rgba(255,255,255,0.7)"
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            
            <div style={{ width: "100%", height: "100%", paddingTop: "10px" }}>
              <h4 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Event Time Series by Type</h4>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 10 }}
                  >
                    <Label value="Date" position="insideBottom" offset={-15} />
                  </XAxis>
                  <YAxis>
                    <Label value="Event Count" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                  </YAxis>
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  {showBattlesLayer && (
                    <Line 
                      type="monotone" 
                      dataKey="battles" 
                      stroke={battleColor}
                      name="Battles"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {showExplosionsLayer && (
                    <Line 
                      type="monotone" 
                      dataKey="explosions" 
                      stroke={explosionColor}
                      name="Explosions"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {showViirsLayer && (
                    <Line 
                      type="monotone" 
                      dataKey="viirs" 
                      stroke={viirsColor}
                      name="VIIRS"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={totalColor}
                    name="Total (Battles+Explosions+VIIRS)"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Rnd>

      )}

      {showChart && chartData.length === 0 && (
        <p style={{ marginTop: "12px", color: "#ff8787" }}>
          No valid date data found (check event_date fields).
        </p>
      )}
    </div>
  );
};

export default AnalysisControlPanel;
