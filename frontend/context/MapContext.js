import React, { createContext } from 'react';

// Initial State Structure
export const initialState = {
  // Layer Controls
  radius: 1000,
  coverage: 1.0,
  showBattlesLayer: true,
  showExplosionsLayer: true,
  showViirsLayer: true,
  showNlqLayer: true, // Added for NLQ results layer visibility

  // Analysis Controls
  brushingEnabled: false,
  brushingRadius: 2000,
  showChart: false, // Assuming this controls a chart panel visibility

  // Data States
  eventData: [],        // Raw data fetched initially
  nlqResults: [],       // Results from NLQ API (can be spatial or aggregated)
  brushedData: [],      // Data points currently under the brush
  timeFilteredData: [], // Data filtered by the time slider
  activeData: [],       // Data currently displayed on the map (derived)
  statsData: [],        // Aggregated stats data from NLQ
  dataSource: 'time-slider', // Tracks the source for activeData ('time-slider', 'nlq', 'brushing')
  layerInfo: {},        // Metadata about current layers for charts/info panels

  // Loading/Error States
  loading: true,        // Initial data loading
  error: null,          // Initial data loading error
  nlqLoading: false,
  nlqError: null,

  // UI States
  hoverInfo: null,      // Info for map tooltip on hover
  clickInfo: null,      // Info for map tooltip on click
  mousePosition: null,  // Current mouse coordinates for brushing
};

// Action Types
export const ActionTypes = {
  // Data Loading
  FETCH_EVENTS_START: 'FETCH_EVENTS_START',
  FETCH_EVENTS_SUCCESS: 'FETCH_EVENTS_SUCCESS',
  FETCH_EVENTS_ERROR: 'FETCH_EVENTS_ERROR',
  FETCH_NLQ_START: 'FETCH_NLQ_START',
  FETCH_NLQ_SUCCESS: 'FETCH_NLQ_SUCCESS',
  FETCH_NLQ_ERROR: 'FETCH_NLQ_ERROR',
  CLEAR_NLQ_RESULTS: 'CLEAR_NLQ_RESULTS',

  // Layer Controls
  SET_RADIUS: 'SET_RADIUS',
  SET_COVERAGE: 'SET_COVERAGE',
  TOGGLE_LAYER: 'TOGGLE_LAYER', // Single action for toggling layers

  // Analysis Controls
  SET_BRUSHING_ENABLED: 'SET_BRUSHING_ENABLED',
  SET_BRUSHING_RADIUS: 'SET_BRUSHING_RADIUS',
  SET_SHOW_CHART: 'SET_SHOW_CHART', // Example if needed

  // Data Interaction
  SET_TIME_FILTERED_DATA: 'SET_TIME_FILTERED_DATA',
  SET_BRUSHED_DATA: 'SET_BRUSHED_DATA',
  SET_DATA_SOURCE: 'SET_DATA_SOURCE', // Explicitly set the data source
  RESET_DATA_SOURCE: 'RESET_DATA_SOURCE', // Reset to default (time-slider or brushing if active)

  // UI State
  SET_HOVER_INFO: 'SET_HOVER_INFO',
  SET_CLICK_INFO: 'SET_CLICK_INFO',
  SET_MOUSE_POSITION: 'SET_MOUSE_POSITION',
  SET_LAYER_INFO: 'SET_LAYER_INFO', // Action to update layerInfo
};

// Reducer Function
export const mapReducer = (state, action) => {
  console.log('Reducer Action:', action.type, action.payload); // For debugging

  switch (action.type) {
    // --- Data Loading ---
    case ActionTypes.FETCH_EVENTS_START:
      return { ...state, loading: true, error: null };
    case ActionTypes.FETCH_EVENTS_SUCCESS:
      // When initial data loads, also set timeFilteredData initially
      // and calculate activeData based on the default time-slider source.
      const newState = {
        ...state,
        loading: false,
        eventData: action.payload,
        timeFilteredData: action.payload, // Set timeFilteredData with the full dataset initially
        dataSource: 'time-slider', // Default to time slider data initially
       };
       return calculateActiveData(newState); // Calculate activeData immediately
    case ActionTypes.FETCH_EVENTS_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ActionTypes.FETCH_NLQ_START:
      return { ...state, nlqLoading: true, nlqError: null };
    case ActionTypes.FETCH_NLQ_SUCCESS: {
      const { results, isSpatial } = action.payload;
      const newState = {
        ...state,
        nlqLoading: false,
        nlqResults: results,
        statsData: isSpatial ? [] : results, // Set statsData if not spatial
        dataSource: isSpatial && results.length > 0 ? 'nlq' : state.dataSource, // Change source only if spatial results exist
      };
      // Recalculate activeData after NLQ results change
      return calculateActiveData(newState);
    }
    case ActionTypes.FETCH_NLQ_ERROR:
      return { ...state, nlqLoading: false, nlqError: action.payload, nlqResults: [] };
    case ActionTypes.CLEAR_NLQ_RESULTS: {
       const newState = { ...state, nlqResults: [], statsData: [], nlqError: null };
        // Reset data source if it was 'nlq'
        if (newState.dataSource === 'nlq') {
            newState.dataSource = newState.brushingEnabled && newState.brushedData.length > 0 ? 'brushing' : 'time-slider';
        }
       return calculateActiveData(newState);
    }


    // --- Layer Controls ---
    case ActionTypes.SET_RADIUS:
      return { ...state, radius: action.payload };
    case ActionTypes.SET_COVERAGE:
      return { ...state, coverage: action.payload };
    case ActionTypes.TOGGLE_LAYER: {
        const { layerName, isVisible } = action.payload;
        const layerStateKey = `show${layerName.charAt(0).toUpperCase() + layerName.slice(1)}Layer`; // e.g., showBattlesLayer
        if (layerStateKey in state) {
            return { ...state, [layerStateKey]: isVisible };
        }
        console.warn(`Unknown layer name to toggle: ${layerName}`);
        return state; // Return unchanged state if layer key is unknown
    }


    // --- Analysis Controls ---
    case ActionTypes.SET_BRUSHING_ENABLED: {
      const newState = { ...state, brushingEnabled: action.payload };
      // If disabling brushing, clear brushed data and potentially reset data source
      if (!action.payload) {
        newState.brushedData = [];
        if (newState.dataSource === 'brushing') {
            newState.dataSource = 'time-slider';
        }
      }
      return calculateActiveData(newState);
    }
    case ActionTypes.SET_BRUSHING_RADIUS:
      // We might need to recalculate brushed data if radius changes while enabled
       const newStateWithRadius = { ...state, brushingRadius: action.payload };
       // If brushing is enabled, recalculate brushed data
       if (newStateWithRadius.brushingEnabled && newStateWithRadius.mousePosition) {
            const updatedBrushedData = calculateBrushedData(
                newStateWithRadius.timeFilteredData, // Brush operates on time-filtered data
                newStateWithRadius.mousePosition,
                action.payload // Use the new radius directly
            );
            newStateWithRadius.brushedData = updatedBrushedData;
            // Update active data if source is brushing
            return calculateActiveData(newStateWithRadius);
       }
       return newStateWithRadius; // No recalculation needed if brushing is off

    case ActionTypes.SET_SHOW_CHART:
        return { ...state, showChart: action.payload };


    // --- Data Interaction ---
    case ActionTypes.SET_TIME_FILTERED_DATA: {
      const newState = { ...state, timeFilteredData: action.payload };
      // Also recalculate brushed data if brushing is enabled
      if (newState.brushingEnabled && newState.mousePosition) {
            newState.brushedData = calculateBrushedData(
                action.payload, // Use the new timeFilteredData
                newState.mousePosition,
                newState.brushingRadius
            );
       }
      return calculateActiveData(newState); // Recalculate active data based on new time filter
    }
     case ActionTypes.SET_BRUSHED_DATA: {
      // This action might be triggered explicitly or implicitly by mouse move/radius change
      const newState = { ...state, brushedData: action.payload };
       // If brushing becomes active (has data) and NLQ isn't the source, set source to brushing
       if (newState.brushingEnabled && action.payload.length > 0 && newState.dataSource !== 'nlq') {
            newState.dataSource = 'brushing';
       } else if (newState.dataSource === 'brushing' && action.payload.length === 0) {
           // If brushing was active but now has no data, revert source
           newState.dataSource = 'time-slider';
       }
      return calculateActiveData(newState);
    }
    case ActionTypes.SET_DATA_SOURCE: // Allow explicitly setting the source (e.g., for NLQ)
      return calculateActiveData({ ...state, dataSource: action.payload });
    case ActionTypes.RESET_DATA_SOURCE: { // Reset button action
      const newState = { ...state, nlqResults: [], statsData: [], nlqError: null }; // Clear NLQ stuff on reset
      newState.dataSource = 'time-slider'; // Always go back to time slider on manual reset
      return calculateActiveData(newState);
    }

    // --- UI State ---
    case ActionTypes.SET_HOVER_INFO:
      return { ...state, hoverInfo: action.payload };
    case ActionTypes.SET_CLICK_INFO:
      return { ...state, clickInfo: action.payload };
    case ActionTypes.SET_MOUSE_POSITION: {
      const newState = { ...state, mousePosition: action.payload };
      // Recalculate brushed data if brushing is enabled
       if (newState.brushingEnabled && action.payload) {
            const updatedBrushedData = calculateBrushedData(
                newState.timeFilteredData,
                action.payload, // Use new mouse position
                newState.brushingRadius
            );
             newState.brushedData = updatedBrushedData;
             // If brushing becomes active (has data) and NLQ isn't the source, set source to brushing
             if (updatedBrushedData.length > 0 && newState.dataSource !== 'nlq') {
                 newState.dataSource = 'brushing';
             } else if (newState.dataSource === 'brushing' && updatedBrushedData.length === 0) {
                 // If brushing was active but now has no data, revert source
                 newState.dataSource = 'time-slider';
             }
            return calculateActiveData(newState);
       }
       // If brushing disabled or mouse position is null, just update position
      return newState;
    }
    case ActionTypes.SET_LAYER_INFO:
        return { ...state, layerInfo: action.payload };


    default:
      // Consider throwing error for unhandled actions in development
      // throw new Error(`Unhandled action type: ${action.type}`);
      return state;
  }
};

// Helper function to calculate activeData based on dataSource
// This centralizes the logic previously in DeckMap's useEffect
const calculateActiveData = (state) => {
  let newActiveData = [];
  if (state.dataSource === 'nlq' && state.nlqResults.length > 0) {
    // Check if NLQ results are spatial before assigning
    const firstItem = state.nlqResults[0];
     const hasSpatialData = firstItem &&
                           (firstItem.latitude !== undefined || firstItem.longitude !== undefined ||
                            firstItem.lat !== undefined || firstItem.lon !== undefined ||
                            firstItem.geo_lat !== undefined || firstItem.geo_lon !== undefined);
     if (hasSpatialData) {
        newActiveData = state.nlqResults;
     } else {
         // NLQ results are not spatial, keep previous active data (likely timeFilteredData or brushedData)
         if (state.dataSource === 'brushing' && state.brushedData.length > 0) {
            newActiveData = state.brushedData;
         } else {
            newActiveData = state.timeFilteredData;
         }
     }

  } else if (state.dataSource === 'brushing' && state.brushedData.length > 0) {
    newActiveData = state.brushedData;
  } else { // Default to time-slider
    newActiveData = state.timeFilteredData;
  }

  console.log(`Recalculated Active Data (Source: ${state.dataSource}): ${newActiveData.length} points`);
  return { ...state, activeData: newActiveData };
};

// Helper to calculate brushed data (moved from DeckMap's useEffect)
// Operates on the timeFilteredData as the base for brushing
const calculateBrushedData = (timeFilteredData, mousePosition, brushingRadius) => {
    if (!mousePosition || !timeFilteredData || timeFilteredData.length === 0) {
        return [];
    }
    const [mouseX, mouseY] = mousePosition;
    // Rough approximation for distance calculation (more accurate methods exist)
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLon = metersPerDegreeLat * Math.cos(mouseY * Math.PI / 180);

    const brushed = [];
    for (const point of timeFilteredData) {
        // Ensure point has valid coordinates
         if (point && point.latitude != null && point.longitude != null) {
            const dx = (point.longitude - mouseX) * metersPerDegreeLon;
            const dy = (point.latitude - mouseY) * metersPerDegreeLat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= brushingRadius) {
                brushed.push(point);
            }
         }
    }
     console.log(`Calculated Brushed Data: ${brushed.length} points within ${brushingRadius}m`);
    return brushed;
};


// Create the context
export const MapContext = createContext({
  state: initialState,
  dispatch: () => null, // Placeholder dispatch function
}); 