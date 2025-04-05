// ControlPanelSpeedDial.js
import React, { useState, lazy, Suspense, useContext } from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import CircularProgress from "@mui/material/CircularProgress";

// Context (Optional: SpeedDial itself might not need it, but sub-panels will)
// import { MapContext } from '../../context/MapContext';

// MUI icons
import LayersIcon from "@mui/icons-material/Layers";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ElipsesIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CalculateIcon from "@mui/icons-material/Calculate";

// Lazy load sub-panels
const SearchAggregationPanel = lazy(() => import("./search-aggregation-panel"));
const LayerControlPanel = lazy(() => import("./layer-control-panel"));
const AnalysisControlPanel = lazy(() => import("./analysis-control-panel"));
const CentralTendencyPanel = lazy(() => import("./central-tendency-panel"));
const InfoPage = lazy(() => import("./info-page"));

const headerHeight = 64;

// The "actions" array for speed-dial
const actions = [
  { icon: <SearchIcon />, name: "Search & Aggregation", action: "toggleSearchAgg" },
  { icon: <LayersIcon />, name: "Layer Controls", action: "toggleLayerMenu" },
  { icon: <InsertChartIcon />, name: "Analysis Controls", action: "toggleAnalysisMenu" },
  { icon: <CalculateIcon />, name: "Central Tendency", action: "toggleCentralTendency" },
  { icon: <ElipsesIcon />, name: "Info Page", action: "toggleInfoPage" }
];

// Removed most props, as sub-panels will get state/dispatch from context
export default function ControlPanelSpeedDial() {
  // Optional: Access context here if needed for SpeedDial logic itself
  // const { state, dispatch } = useContext(MapContext); 
  
  const [activePanel, setActivePanel] = useState(null);

  const handleSpeedDialAction = (action) => {
    setActivePanel((prev) => (prev === action ? null : action));
  };

  // Basic fallback UI for Suspense
  const renderFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress size={24} />
      </Box>
  );

  return (
    <Box sx={{ position: "absolute", top: headerHeight + 16, left: 16, zIndex: 1100 }}>
      {/* The SpeedDial "FAB" */}
      <SpeedDial
        ariaLabel="Control Panel Actions"
        sx={{ position: "absolute", top: 0, left: 0 }}
        icon={<SpeedDialIcon />}
        direction="right"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleSpeedDialAction(action.action)}
          />
        ))}
      </SpeedDial>

      {/* Sub-Panel Container - Controls visibility based on activePanel */}
      <Box
         sx={{
            position: "absolute",
            top: 60, // Position below the SpeedDial FAB
            left: 0,
            zIndex: 1050, // Below SpeedDial FAB but above map controls
          }}
      >
        {/* ---------- Sub-Panel: Search & Aggregation ---------- */}
        {activePanel === "toggleSearchAgg" && (
            <Suspense fallback={renderFallback()}>
                <SearchAggregationPanel /> 
            </Suspense>
        )}

        {/* ---------- Sub-Panel: Layer Controls ---------- */}
         {activePanel === "toggleLayerMenu" && (
            <Suspense fallback={renderFallback()}>
                <LayerControlPanel />
            </Suspense>
         )}

        {/* ---------- Sub-Panel: Analysis Controls ---------- */}
        {activePanel === "toggleAnalysisMenu" && (
            <Suspense fallback={renderFallback()}>
                <AnalysisControlPanel />
            </Suspense>
        )}

        {/* ---------- Sub-Panel: Central Tendency ---------- */}
        {activePanel === "toggleCentralTendency" && (
             <Suspense fallback={renderFallback()}>
                <CentralTendencyPanel />
             </Suspense>
        )}

        {/* ---------- Sub-Panel: Info Page ---------- */}
        {activePanel === "toggleInfoPage" && (
             <Suspense fallback={renderFallback()}>
                 <InfoPage />
             </Suspense>
        )}
      </Box>
    </Box>
  );
}
