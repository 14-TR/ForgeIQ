import React, { useEffect, useReducer, useMemo, useCallback } from 'react';
import { MapContext, initialState, mapReducer, ActionTypes } from './MapContext';
import { useFetchEvents } from '../hooks/use-fetch-events';
import { createLayers } from '../utils/layer-creator'; // Correct path assuming MapProvider is in context/

export const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Use the hook to get the raw fetch function and its states
  // Note: useFetchEvents originally had its own useEffect for fetching.
  // We'll trigger the fetch from the provider instead.
  const { eventData: rawEventData, loading: eventsLoading, error: eventsError, fetchAllEndpoints } = useFetchEvents();

  // --- Initial Data Fetching ---
  // Trigger initial data fetch on mount
  useEffect(() => {
    dispatch({ type: ActionTypes.FETCH_EVENTS_START });
    fetchAllEndpoints()
      .then(allData => {
        console.log('MapProvider: Initial fetch successful', allData.length);
        dispatch({ type: ActionTypes.FETCH_EVENTS_SUCCESS, payload: allData });
        // Note: TimeSlider component will be responsible for the *initial* filtering
        // and dispatching SET_TIME_FILTERED_DATA based on the full eventData.
      })
      .catch(err => {
        console.error('MapProvider: Initial fetch failed', err);
        dispatch({ type: ActionTypes.FETCH_EVENTS_ERROR, payload: err.message });
      });
  }, [fetchAllEndpoints]); // Depend on the fetch function from the hook


  // --- Layer Info Calculation ---
  // Calculate layer info whenever relevant state changes
  // This replaces the useEffect in DeckMap for layerInfo calculation
  const calculateAndSetLayerInfo = useCallback(() => {
      const { layerInfo } = createLayers({
          eventData: state.activeData,
          radius: state.radius,
          coverage: state.coverage,
          showBattlesLayer: state.showBattlesLayer,
          showExplosionsLayer: state.showExplosionsLayer,
          showViirsLayer: state.showViirsLayer,
          showNlqLayer: state.showNlqLayer, // Include NLQ layer visibility
          // Pass other necessary props if layer-creator needs them
          // e.g., brushing info if layers should visually react to brushing state
          brushingEnabled: state.brushingEnabled,
          brushingRadius: state.brushingRadius,
          mousePosition: state.mousePosition
          // Pass brushingExtension if available/needed by createLayers
      });
      dispatch({ type: ActionTypes.SET_LAYER_INFO, payload: layerInfo });
  }, [
      state.activeData,
      state.radius,
      state.coverage,
      state.showBattlesLayer,
      state.showExplosionsLayer,
      state.showViirsLayer,
      state.showNlqLayer,
      state.brushingEnabled,
      state.brushingRadius,
      state.mousePosition
      // Add brushingExtension here if it's part of state or passed differently
  ]);

  // Recalculate layerInfo whenever dependencies change
  useEffect(() => {
      calculateAndSetLayerInfo();
  }, [calculateAndSetLayerInfo]);


  // Combine loading states
  const combinedLoading = state.loading || state.nlqLoading;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state: { ...state, loading: combinedLoading }, // Provide combined loading state
    dispatch,
  }), [state, dispatch, combinedLoading]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}; 