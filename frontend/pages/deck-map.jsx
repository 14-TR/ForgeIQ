import React, { useEffect, useRef, useCallback, useContext } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { BrushingExtension } from '@deck.gl/extensions';

// Context and Actions
import { MapContext, ActionTypes } from "../context/MapContext";

// Utils
import { lightingEffect, INITIAL_VIEW_STATE, MAP_STYLE } from "../utils/map-config";
import { createLayers } from "../utils/layer-creator";

// Components (Update paths if moved)
import ControlPanelSpeedDial from "../components/core/control-panel-speeddial";
import TimeSlider from "../components/ui/time-slider";
import MapTooltip from "../components/map/map-tooltip";

// Removed custom hooks useFetchEvents, useNlqHandler

const DeckMap = () => {
  // Access state and dispatch from context
  const { state, dispatch } = useContext(MapContext);
  const { 
    // Layer Controls
    radius,
    coverage,
    showBattlesLayer,
    showExplosionsLayer,
    showViirsLayer,
    showNlqLayer,
    // Analysis Controls
    brushingEnabled,
    brushingRadius,
    showChart,
    // Data States
    eventData, // Keep eventData for TimeSlider input
    activeData,
    statsData,
    dataSource,
    brushedData, // Needed for brushing status display
    layerInfo,
    // Loading/Error States
    loading,
    error,
    nlqLoading,
    nlqError,
    // UI States
    hoverInfo,
    clickInfo,
    mousePosition
  } = state;

  // deck.gl ref
  const deckRef = useRef(null);
  
  // Instantiate brushing extension (could potentially be moved to context if needed elsewhere)
  const brushingExtension = useRef(new BrushingExtension()).current;

  // --- Callbacks --- (Now dispatch actions)
  const handleHover = useCallback((info) => {
    dispatch({ type: ActionTypes.SET_HOVER_INFO, payload: info.picked ? info : null });
  }, [dispatch]);

  const handleClick = useCallback((info) => {
      dispatch({ type: ActionTypes.SET_CLICK_INFO, payload: info.picked ? info : null });
  }, [dispatch]);

  const handleMouseMove = useCallback((event) => {
     // Dispatch mouse position, reducer handles brushed data calculation if enabled
      dispatch({ type: ActionTypes.SET_MOUSE_POSITION, payload: event.coordinate });
  }, [dispatch]); // BrushingEnabled is handled in reducer
  
  // Cleanup function (can remain if necessary for non-React cleanup)
  useEffect(() => {
    return () => {
      // Example cleanup (if window.controls was used)
      if (window.controls) {
         if (window.controls.domElement) {
             // Remove listeners
         }
         window.controls = null;
      }
      if (window.scene) {
        window.scene = null;
      }
    };
  }, []);
  
  // --- Layer Creation --- (Uses context state)
  // Note: layerInfo is now calculated in MapProvider
  const { layers } = createLayers({
    eventData: activeData,
    radius,
    coverage,
    showBattlesLayer,
    showExplosionsLayer,
    showViirsLayer,
    showNlqLayer, // Pass NLQ layer visibility
    onHover: handleHover,
    onClick: handleClick,
    brushingEnabled,
    brushingRadius,
    brushingExtension,
    mousePosition
  });

  // --- Render Logic ---
  if (loading && eventData.length === 0) return <div>Loading data...</div>; // Show loading only initially
  if (error) return <div>Error loading initial data: {error}</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* SpeedDial - Props simplified, will use context internally */}
      <ControlPanelSpeedDial
        // Pass only data needed for display or triggering actions
        // Setters/Direct state manipulation props removed
        statsData={statsData}
        nlqLoading={nlqLoading}
        nlqError={nlqError}
        displayData={activeData} // Pass activeData for potential display/analysis in panels
        dataSource={dataSource}
        layerInfo={layerInfo} // Pass calculated layerInfo
        // Pass dispatch down or let child components use context
        // dispatch={dispatch} // Option 1: Pass dispatch
      />

      {/* Time Slider - Receives full data, dispatches filtered data action */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 1000 }}>
        <TimeSlider 
          eventData={eventData} // Pass full dataset
          // Removed setFilteredData - TimeSlider will dispatch SET_TIME_FILTERED_DATA
        />
      </div>

      {/* Status indicators based on context state */}
      {nlqLoading && (
        <div style={infoStyles}>Processing query...</div>
      )}
      {nlqError && (
        <div style={{ ...infoStyles, color: "red" }}>
          {nlqError}
        </div>
      )}
      
      {brushingEnabled && mousePosition && (
        <div style={{ ...infoStyles, top: 120, backgroundColor: 'rgba(0,100,255,0.7)' }}>
          Brushing: {brushedData.length} events selected
        </div>
      )}
      
      <div style={{ ...infoStyles, top: 160, backgroundColor: 'rgba(0,0,0,0.6)' }}>
        Data Source: {dataSource === 'nlq' ? 'Search Query' : dataSource === 'brushing' ? 'Brushing' : 'Time Filter'}
      </div>

      {/* Tooltips based on context state */}
      {hoverInfo && !clickInfo && <MapTooltip info={hoverInfo} />}
      {clickInfo && <MapTooltip info={clickInfo} />}

      <DeckGL
        ref={deckRef}
        layers={layers}
        effects={[lightingEffect]} // Assuming lightingEffect is stable
        initialViewState={INITIAL_VIEW_STATE} // Assuming INITIAL_VIEW_STATE is stable
        controller
        // getTooltip={({object}) => object && `${object.points ? object.points.length : 0} events`} // Tooltip handled by MapTooltip component
        onClick={(info) => {
          // Simplified: always dispatch click info
           dispatch({ type: ActionTypes.SET_CLICK_INFO, payload: info.picked ? info : null });
        }}
        onHover={handleHover}
        onMouseMove={handleMouseMove}
      >
        <Map reuseMaps mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
};

const infoStyles = {
  position: "absolute",
  top: 80,
  left: 20,
  color: "#fff",
  background: "rgba(0,0,0,0.6)",
  padding: "4px 8px",
  borderRadius: 4,
  zIndex: 999,
};

export default DeckMap;
