// hooks/use-fetch-events.js
import { useState, useCallback } from "react";
import { API_BASE_URL } from "../config.js";

// Calculate date range for last 5 years (increased from 2 years)
const getDateRange = () => {
  const today = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  
  // Format as YYYY-MM-DD
  const startDateStr = fiveYearsAgo.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];
  
  return { startDateStr, endDateStr };
};

const { startDateStr, endDateStr } = getDateRange();
console.log(`API Date Range: ${startDateStr} to ${endDateStr}`);

// Base API URL
const BASE_URL = API_BASE_URL;
// Endpoints for different data types with date filtering
const ENDPOINTS = {
  battles: `${BASE_URL}/battles?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`,
  explosions: `${BASE_URL}/explosions?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`,
  viirs: `${BASE_URL}/viirs?start_date=${startDateStr}&end_date=${endDateStr}&limit=40000`
};

// For processing extremely large datasets
const BATCH_SIZE = 5000; // Increased batch size for better performance
const MAX_TOTAL_EVENTS = 150000; // Cap total events to prevent memory issues

// --- Hook Definition ---
export const useFetchEvents = () => {
  // Removed useState for eventData, loading, error

  // --- Helper Functions --- (Keep these within the hook or move to utils)
  const processInBatches = useCallback((items, processFn) => {
    if (!items || items.length === 0) return [];
    const needsSampling = items.length > BATCH_SIZE * 2;
    const samplingRate = needsSampling ? BATCH_SIZE * 2 / items.length : 1;
    let itemsToProcess = items;
    if (needsSampling) {
      itemsToProcess = [];
      for (let i = 0; i < items.length; i++) {
        if (Math.random() < samplingRate) {
          itemsToProcess.push(items[i]);
        }
      }
      console.log(`Sampled ${items.length} items down to ${itemsToProcess.length} (${(samplingRate * 100).toFixed(1)}%)`);
    }
    const result = [];
    const totalItems = itemsToProcess.length;
    const batchCount = Math.ceil(totalItems / BATCH_SIZE);
    // console.log(`Processing ${totalItems} items in ${batchCount} batches of size ${BATCH_SIZE}`); // Less verbose logging
    for (let i = 0; i < batchCount; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, totalItems);
      const batch = itemsToProcess.slice(start, end);
      const processedBatch = batch.map(processFn); // Simplified batch processing
      result.push(...processedBatch);
    }
    return result;
  }, []);

  const processViirsData = useCallback((data, eventType) => {
    return processInBatches(data, item => {
        let eventDate = item.event_date;
        if (!eventDate && item.acq_time) {
            if (typeof item.acq_time === 'number') {
                const hours = Math.floor(item.acq_time / 100);
                const minutes = item.acq_time % 100;
                const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                const baseDate = item.event_date ? new Date(item.event_date) : new Date(); // Use item date if available
                // Ensure baseDate is valid before proceeding
                if (!isNaN(baseDate.getTime())) {
                    eventDate = baseDate.toISOString().split('T')[0] + 'T' + timeStr + ':00Z'; // Add seconds and Z for ISO
                } else {
                    // Fallback if baseDate is invalid
                    eventDate = new Date().toISOString().split('T')[0] + 'T' + timeStr + ':00Z';
                }
            } else {
                eventDate = item.acq_time; // Assume it's already a string
            }
        }

        const brightness = item.bright_ti4 || item.bright_ti5 || 300;
        return {
            ...item,
            event_type: eventType,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            fatalities: Math.max(1, Math.min(20, Math.round(brightness / 15))), // Use brightness for size
            event_date: eventDate || new Date().toISOString().split('T')[0], // Fallback date
            location: item.location || `VIIRS ${item.satellite || ''} ${item.confidence || ''}`.trim(),
            notes: `Satellite: ${item.satellite || 'N/A'}, Brightness: ${brightness}, Confidence: ${item.confidence || 'N/A'}, Day/Night: ${item.daynight || 'N/A'}`
        };
    });
}, [processInBatches]);


  const processGenericData = useCallback((data, eventType) => {
    return processInBatches(data, item => ({
      ...item,
      event_type: eventType,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude)
      // Add a default event_date if missing, crucial for TimeSlider
      // event_date: item.event_date || new Date().toISOString().split('T')[0]
    }));
  }, [processInBatches]);

  const fetchEndpoint = useCallback(async (url, eventType) => {
    // console.log(`📡 Fetching from: ${url}`); // Less verbose logging
    try {
      const response = await fetch(url, { /* headers, mode */ });
      // console.log(`Response from ${url}:`, response.status); // Less verbose
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
      }
      const text = await response.text();
      // console.log(`${url} response size: ${(text.length/1024).toFixed(2)}KB`);
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return [];

      // Select appropriate processor
      const processor = eventType === 'viirs' ? processViirsData : processGenericData;
      return processor(data, eventType);

    } catch (error) {
      console.error(`Error fetching ${eventType} from ${url}:`, error);
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  }, [processViirsData, processGenericData]);

  // --- Exposed Fetch Function ---
  // This function will be called by the provider
  const fetchAllEndpoints = useCallback(async () => {
    console.log("📡 Fetching all event data...");
    try {
      console.log("[fetchAllEndpoints] Awaiting Promise.allSettled..."); // New log
      const results = await Promise.allSettled([
        fetchEndpoint(ENDPOINTS.battles, 'battle'),
        fetchEndpoint(ENDPOINTS.explosions, 'explosion'),
        fetchEndpoint(ENDPOINTS.viirs, 'viirs')
      ]);
      console.log("[fetchAllEndpoints] Promise.allSettled finished.", results); // New log

      let allData = [];
      let errors = [];
      console.log("[fetchAllEndpoints] Processing results..."); // New log
      results.forEach((result, index) => {
        const endpointName = Object.keys(ENDPOINTS)[index];
        console.log(`[fetchAllEndpoints] Processing result for: ${endpointName}`); // New log
        if (result.status === 'fulfilled') {
           // Check if result.value is actually an array before accessing length
           const dataLength = Array.isArray(result.value) ? result.value.length : 'N/A (not an array)';
           console.log(`✅ ${endpointName} OK: ${dataLength} events`);
          let dataToAdd = result.value;

          // Ensure dataToAdd is an array before proceeding with sampling/pushing
          if (!Array.isArray(dataToAdd)) {
            console.warn(`❗ ${endpointName} FULFILLED but value is not an array:`, dataToAdd);
            dataToAdd = []; // Treat as empty to prevent errors
          }

          // Apply MAX_TOTAL_EVENTS limit logic (sampling)
          if (allData.length + dataToAdd.length > MAX_TOTAL_EVENTS) {
             const remainingSpace = Math.max(0, MAX_TOTAL_EVENTS - allData.length);
              if (remainingSpace > 0) {
                const sampleRate = remainingSpace / dataToAdd.length;
                const sampledData = dataToAdd.filter(() => Math.random() < sampleRate);
                dataToAdd = sampledData;
                console.log(`⚠️ Sampled ${endpointName} to ${dataToAdd.length} events`);
              } else {
                 console.warn(`❗ Skipping ${endpointName} data - limit reached`);
                 dataToAdd = [];
              }
          }
          allData.push(...dataToAdd);
        } else {
          // Log the reason message safely
          const reasonMsg = result.reason?.message || result.reason || 'Unknown error';
          console.error(`❌ ${endpointName} FAILED:`, reasonMsg);
          errors.push(`${endpointName}: ${reasonMsg}`);
        }
        console.log(`[fetchAllEndpoints] Finished processing result for: ${endpointName}`); // New log
      });

      console.log(`✅ Total combined data fetched: ${allData.length} events`);
      if (errors.length > 0) {
        const combinedErrorMsg = `Some endpoints failed: ${errors.join('; ')}`;
        console.log(`[fetchAllEndpoints] Throwing combined error: ${combinedErrorMsg}`); // New log
        // Throw an error that combines individual failures
        throw new Error(combinedErrorMsg);
      }
      console.log("[fetchAllEndpoints] Returning combined data."); // New log
      return allData; // Return the combined data

    } catch (err) {
      // Ensure we log the error caught within fetchAllEndpoints itself
      console.error("❌ Error within fetchAllEndpoints try block:", err); 
      throw err; // Re-throw the error to be caught by the provider
    }
  }, [fetchEndpoint]);

  // Return only the function needed by the provider
  return { fetchAllEndpoints };
};
