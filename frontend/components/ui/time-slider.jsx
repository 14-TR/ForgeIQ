import React, { useState, useRef, useEffect, useCallback, useMemo, useContext } from "react";
import { Slider, Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Import context and actions
import { MapContext, ActionTypes } from "../../context/MapContext"; // Adjust path as needed

/**
 * TimeSlider uses the entire dataset (eventData from context).
 * - Initially calculates and dispatches the filter for the last year.
 * - Whenever user moves the slider, dispatches updated filtered data.
 */
const TimeSlider = () => {
  // Get state and dispatch from context
  const { state, dispatch } = useContext(MapContext);
  const { eventData } = state; // Get eventData from context state

  // Ref to ensure initial load logic runs once
  const didInitRef = useRef(false);

  // Local slider range 0..100
  const [timeRange, setTimeRange] = useState([0, 100]); // Default range before data loads
  
  // Animation state (local to the slider)
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50); // milliseconds per frame
  const animationRef = useRef(null);
  
  // Store animation settings for reuse
  const animationSettingsRef = useRef({
    initialStart: 0,
    initialEnd: 100,
    windowSize: 100,
    currentPosition: 0
  });

  // Determine date range based on eventData from context
  const { minDate, maxDate } = useMemo(() => {
      const calculatedMinDate = new Date("2018-01-01"); // Or derive from data if needed
      let calculatedMaxDate = new Date(); // Default to today

      if (eventData && eventData.length > 0) {
          let max = 0; // Initialize with 0 or a very small date
          const step = eventData.length > 10000 ? Math.floor(eventData.length / 1000) : 1;
          for (let i = 0; i < eventData.length; i += step) {
              if (eventData[i]?.event_date) {
                  const time = new Date(eventData[i].event_date).getTime();
                  if (!isNaN(time) && time > max) {
                      max = time;
                  }
              }
          }
          // Only update maxDate if we found a valid maximum time
          if (max > 0) {
             calculatedMaxDate = new Date(max);
          }
      }
       return { minDate: calculatedMinDate, maxDate: calculatedMaxDate };
  }, [eventData]);


  // Computed "last year" from maxDate
  const oneYearAgo = useMemo(() => {
    if (!maxDate) return new Date(); // Handle case where maxDate isn't calculated yet
    const date = new Date(maxDate);
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, [maxDate]);

  // Filter data and dispatch action
  const filterData = useCallback((startPercent, endPercent) => {
    console.time('Time slider filtering');
    
    if (!eventData || eventData.length === 0 || !minDate || !maxDate) {
      console.warn("TimeSlider: No eventData or date range available to filter");
      dispatch({ type: ActionTypes.SET_TIME_FILTERED_DATA, payload: [] }); // Dispatch empty array
      console.timeEnd('Time slider filtering');
      return;
    }

    // Ensure minDate and maxDate are valid Date objects before calculation
    const minTime = minDate.getTime();
    const maxTime = maxDate.getTime();
    if (isNaN(minTime) || isNaN(maxTime) || minTime >= maxTime) {
        console.error("TimeSlider: Invalid min/max date for filtering.", { minDate, maxDate });
        dispatch({ type: ActionTypes.SET_TIME_FILTERED_DATA, payload: [] });
        console.timeEnd('Time slider filtering');
        return;
    }

    const startTime = new Date(
      minTime + (startPercent / 100) * (maxTime - minTime)
    );
    const endTime = new Date(
      minTime + (endPercent / 100) * (maxTime - minTime)
    );
    
    console.log("TimeSlider filtering data:", {
      dateRange: `${startTime.toISOString().slice(0, 10)} → ${endTime.toISOString().slice(0, 10)}`,
      totalEvents: eventData.length
    });
    
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const maxEvents = 50000; // Keep limit for performance
    let filtered = [];
    
    for (let i = 0; i < eventData.length; i++) {
      const item = eventData[i];
      if (!item || !item.event_date) continue;
      
      const dt = new Date(item.event_date);
      if (isNaN(dt.getTime())) continue;
      
      const timestamp = dt.getTime();
      if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
        filtered.push(item);
        if (filtered.length >= maxEvents) {
            console.warn(`TimeSlider: Limiting displayed events to ${maxEvents}`);
            break; // Stop filtering once limit is reached
        }
      }
    }
    
    console.log(`TimeSlider: Filtered ${filtered.length} out of ${eventData.length} events`);
    
    // Dispatch the filtered data to the context
    dispatch({ type: ActionTypes.SET_TIME_FILTERED_DATA, payload: filtered });
    console.timeEnd('Time slider filtering');
  }, [eventData, minDate, maxDate, dispatch]); // Added dispatch dependency

  // On mount & if data loaded, do initial load once
  useEffect(() => {
    // Check if data is loaded, dates are calculated, and init hasn't run
    if (!didInitRef.current && eventData && eventData.length > 0 && minDate && maxDate && !isNaN(minDate.getTime()) && !isNaN(maxDate.getTime()) && minDate < maxDate) {
      didInitRef.current = true;
      
      const startPercent = Math.max(0, ((oneYearAgo.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100);
      const endPercent = 100;

      // Ensure startPercent is valid and less than endPercent
      const validatedStartPercent = isNaN(startPercent) ? 0 : Math.min(startPercent, endPercent - 1); // Ensure at least 1% window

      setTimeRange([validatedStartPercent, endPercent]);
      
      // Schedule the initial filter dispatch
      setTimeout(() => {
        filterData(validatedStartPercent, endPercent);
      }, 0);
    }
  }, [eventData, filterData, oneYearAgo, minDate, maxDate]); // Dependencies updated

  // Handle slider interaction
  const handleChange = (event, newValue) => {
    if (isAnimating) {
        stopAnimation(); // Stop animation if user interacts
    }
    setTimeRange(newValue);
    // Debounce or throttle this call if performance is an issue
    filterData(newValue[0], newValue[1]); 
  };

  // --- Animation functions --- (Remain largely the same, use filterData)
  const startAnimation = () => {
    if (animationRef.current) return;
    setIsAnimating(true);
    
    const initialStart = timeRange[0];
    const initialEnd = timeRange[1];
    const windowSize = initialEnd - initialStart;
    
    animationSettingsRef.current = {
      initialStart, initialEnd, windowSize, currentPosition: initialStart
    };
    
    const animate = () => {
      let { currentPosition, windowSize } = animationSettingsRef.current;
      currentPosition += 0.5; // Animation step
      if (currentPosition >= 100) {
        currentPosition = 0; // Loop
      }
      const newEnd = Math.min(100, currentPosition + windowSize);
      setTimeRange([currentPosition, newEnd]);
      filterData(currentPosition, newEnd); // Dispatch filtered data
      animationSettingsRef.current.currentPosition = currentPosition;
      animationRef.current = setTimeout(animate, animationSpeed);
    };
    animationRef.current = setTimeout(animate, animationSpeed);
  };
  
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };
  
  const resetAnimation = () => {
    stopAnimation();
    const initialStart = animationSettingsRef.current.initialStart;
    const initialEnd = animationSettingsRef.current.initialEnd;
    setTimeRange([initialStart, initialEnd]);
    filterData(initialStart, initialEnd);
  };
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => { stopAnimation(); };
  }, []);

  // Calculate display dates based on current timeRange state
  const displayStartTime = useMemo(() => {
      if (!minDate || !maxDate || isNaN(minDate.getTime()) || isNaN(maxDate.getTime())) return new Date(0);
      return new Date(minDate.getTime() + (timeRange[0] / 100) * (maxDate.getTime() - minDate.getTime()));
  }, [minDate, maxDate, timeRange]);

  const displayEndTime = useMemo(() => {
      if (!minDate || !maxDate || isNaN(minDate.getTime()) || isNaN(maxDate.getTime())) return new Date();
      return new Date(minDate.getTime() + (timeRange[1] / 100) * (maxDate.getTime() - minDate.getTime()));
  }, [minDate, maxDate, timeRange]);


  return (
    <Box
      sx={{
        width: 360,
        p: 2,
        backgroundColor: "#2c2c2c",
        borderRadius: 2,
        color: "#f5f5f5",
      }}
    >
      <Typography gutterBottom>Time Filter</Typography>
      <Slider
        value={timeRange}
        onChange={handleChange}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        // Disable slider if data hasn't loaded or range is invalid
        disabled={!eventData || eventData.length === 0 || !minDate || !maxDate || isNaN(minDate.getTime()) || isNaN(maxDate.getTime())}
        sx={{ color: "#8884d8" }}
      />
      <Typography variant="caption" display="block">
        {`${displayStartTime.toISOString().slice(0, 10)} → ${displayEndTime
          .toISOString()
          .slice(0, 10)}`}
      </Typography>
      
      {/* Animation Controls */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption">Animation:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <Tooltip title="Reset Animation Start">
            <IconButton 
              size="small" 
              onClick={resetAnimation}
               disabled={!eventData || eventData.length === 0} // Disable if no data
              sx={{ color: '#f5f5f5' }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {isAnimating ? (
            <Tooltip title="Pause">
              <IconButton 
                size="small" 
                onClick={stopAnimation}
                 disabled={!eventData || eventData.length === 0}
                sx={{ color: '#f5f5f5' }}
              >
                <PauseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Play">
              <IconButton 
                size="small" 
                onClick={startAnimation}
                 disabled={!eventData || eventData.length === 0}
                sx={{ color: '#f5f5f5' }}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Display current animation time - optional */}
          {/* <Typography variant="caption" sx={{ ml: 1, minWidth: '80px' }}>
            {isAnimating ? displayStartTime.toISOString().slice(0, 10) : ""}
          </Typography> */}
        </Box>
      </Box>
      
      {/* Animation Speed Control */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ mr: 1 }}>Speed:</Typography>
        <Slider
          size="small"
          value={100 - animationSpeed}
          onChange={(_, value) => setAnimationSpeed(100 - value)}
          min={0} // Fastest
          max={95} // Slowest (100 - 5ms interval)
           disabled={!eventData || eventData.length === 0}
          sx={{ color: "#8884d8" }}
        />
      </Box>
    </Box>
  );
};

export default TimeSlider;
