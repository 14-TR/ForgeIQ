import { useCallback } from "react";
import { ActionTypes } from "../context/MapContext"; // Import actions

// Adjust to match your EC2 FastAPI server
const NLQ_API_URL = "http://3.21.183.77:8000/nlq";

// Hook now accepts the dispatch function from the context
export const useNlqHandler = (dispatch) => {
  // Removed useState for nlqResults, nlqLoading, nlqError

  const fetchNlqResults = useCallback(async (userQuery) => {
    if (!dispatch) {
        console.error("useNlqHandler requires dispatch function.");
        return;
    }

    // Dispatch start action
    dispatch({ type: ActionTypes.FETCH_NLQ_START });

    try {
      console.log(`Processing NLQ query: "${userQuery}"`);
      const response = await fetch(NLQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) {
         const errorBody = await response.text();
         console.error("NLQ API Error Response:", errorBody);
         throw new Error(`NLQ API Error! Status: ${response.status} - ${response.statusText || errorBody}`);
      }

      const data = await response.json();
      console.log("📡 NLQ Response (parsed data):", data);

      if (!data || data.length === 0) {
         console.log("No results returned from NLQ query");
         // Dispatch error action for no results
         dispatch({ type: ActionTypes.FETCH_NLQ_ERROR, payload: "No results found for this query" });
         return;
      }

      // Determine if data is spatial
      const firstItem = data[0];
      const isSpatial = firstItem && (
         firstItem.latitude !== undefined || firstItem.longitude !== undefined ||
         firstItem.lat !== undefined || firstItem.lon !== undefined ||
         firstItem.geo_lat !== undefined || firstItem.geo_lon !== undefined
      );

      let processedData = [];
      if (isSpatial) {
         // Standardize location fields and ensure event_type
         processedData = data.map(item => {
            const latitude = item.latitude || item.lat || item.geo_lat || null;
            const longitude = item.longitude || item.lon || item.geo_lon || null;
            const eventType = item.event_type ||
                              (item.type ? String(item.type).toLowerCase() :
                              (item.disorder_type ? String(item.disorder_type).toLowerCase() : "nlq_result"));

            return {
                ...item,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                event_type: eventType,
                source: item.source || "NLQ query",
                nlq_query: userQuery
            };
         });

         // Filter out items without valid coordinates AFTER processing
         const validSpatialData = processedData.filter(
            item => item.latitude !== null && item.longitude !== null &&
                   !isNaN(item.latitude) && !isNaN(item.longitude)
         );

         if (validSpatialData.length === 0 && data.length > 0) {
            console.warn("NLQ returned spatial data but no valid coordinates after processing");
             dispatch({ type: ActionTypes.FETCH_NLQ_ERROR, payload: "Query returned spatial data but without valid coordinates" });
            return;
         }
         processedData = validSpatialData;
          console.log(`Processed ${processedData.length} valid spatial results`);
      } else {
         // Aggregated data
         processedData = data;
         console.log(`Received ${processedData.length} aggregated/statistical results`);
      }

      // Dispatch success action
      dispatch({ 
        type: ActionTypes.FETCH_NLQ_SUCCESS, 
        payload: { results: processedData, isSpatial }
      });

    } catch (err) {
      console.error("❌ Error processing NLQ query:", err);
       // Dispatch error action
       dispatch({ type: ActionTypes.FETCH_NLQ_ERROR, payload: err.message });
    } 
    // No finally block needed as loading state is handled by reducer

  }, [dispatch]); // Depend on dispatch

  // Return only the fetch function
  return { fetchNlqResults };
};
