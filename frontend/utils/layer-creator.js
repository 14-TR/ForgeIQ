import { HexagonLayer } from "@deck.gl/aggregation-layers";

export const createLayers = ({ 
  eventData, 
  radius, 
  coverage,
  showBattlesLayer = true,
  showExplosionsLayer = true,
  showViirsLayer = true,
  onHover = null,
  onClick = null,
  brushingEnabled = false,
  brushingRadius = 0,
  brushingExtension = null,
  mousePosition = null
}) => {
  // Performance metrics
  const startTime = performance.now();
  
  if (!eventData || eventData.length === 0) {
    console.warn("⚠️ No event data available for layers.");
    return { layers: [], layerInfo: {} };
  }

  console.log(`Received ${eventData.length} events for layer creation`);

  // Apply sampling for extremely large datasets to improve performance
  const MAX_POINTS_PER_LAYER = 15000;
  let dataToProcess = eventData;
  
  if (eventData.length > MAX_POINTS_PER_LAYER * 3) {
    // For huge datasets, sample the data to reduce processing burden
    const samplingRate = MAX_POINTS_PER_LAYER * 3 / eventData.length;
    console.log(`Dataset too large (${eventData.length} points), sampling at rate: ${samplingRate.toFixed(3)}`);
    
    dataToProcess = [];
    for (let i = 0; i < eventData.length; i++) {
      if (Math.random() < samplingRate) {
        dataToProcess.push(eventData[i]);
      }
    }
    console.log(`Sampled down to ${dataToProcess.length} points`);
  }

  // ✅ Pre-filter for valid data before sending to deck.gl
  console.time('Filtering data');
  const filteredData = [];
  
  for (let i = 0; i < dataToProcess.length; i++) {
    const d = dataToProcess[i];
    if (d && 
        d.latitude !== null && 
        d.longitude !== null && 
        !isNaN(Number(d.latitude)) && 
        !isNaN(Number(d.longitude))) {
      filteredData.push(d);
    }
  }
  console.timeEnd('Filtering data');
  
  if (filteredData.length === 0) {
    console.error("❌ No valid lat/lon data found!");
    return { layers: [], layerInfo: {} };
  }

  console.log(`${filteredData.length} events have valid coordinates`);

  // Filter data by event type with performance optimization
  console.time('Event type filtering');
  const battleData = [];
  const explosionData = [];
  const viirsData = [];
  const nlqResultData = [];
  
  // Single-pass filtering to categorize data
  for (let i = 0; i < filteredData.length; i++) {
    const d = filteredData[i];
    const eventType = String(d.event_type || '').toLowerCase();
    
    if (showBattlesLayer && (eventType === 'battle' || eventType === 'battles')) {
      // Apply sampling for each type if needed
      if (battleData.length < MAX_POINTS_PER_LAYER) {
        battleData.push(d);
      } else if (Math.random() < 0.1) { // 10% chance to replace an existing point
        battleData[Math.floor(Math.random() * MAX_POINTS_PER_LAYER)] = d;
      }
    } 
    else if (showExplosionsLayer && (eventType === 'explosion' || eventType === 'explosions')) {
      if (explosionData.length < MAX_POINTS_PER_LAYER) {
        explosionData.push(d);
      } else if (Math.random() < 0.1) {
        explosionData[Math.floor(Math.random() * MAX_POINTS_PER_LAYER)] = d;
      }
    } 
    else if (showViirsLayer && eventType === 'viirs') {
      if (viirsData.length < MAX_POINTS_PER_LAYER) {
        viirsData.push(d);
      } else if (Math.random() < 0.1) {
        viirsData[Math.floor(Math.random() * MAX_POINTS_PER_LAYER)] = d;
      }
    }
    else if (eventType === 'nlq_result' || 
            (eventType !== 'battle' && 
             eventType !== 'battles' && 
             eventType !== 'explosion' && 
             eventType !== 'explosions' && 
             eventType !== 'viirs')) {
      if (nlqResultData.length < MAX_POINTS_PER_LAYER) {
        nlqResultData.push(d);
      } else if (Math.random() < 0.1) {
        nlqResultData[Math.floor(Math.random() * MAX_POINTS_PER_LAYER)] = d;
      }
    }
  }
  console.timeEnd('Event type filtering');

  console.log("Data counts by type:", {
    battles: battleData.length,
    explosions: explosionData.length,
    viirs: viirsData.length,
    nlq_results: nlqResultData.length,
    total: filteredData.length,
    sampled: battleData.length + explosionData.length + viirsData.length + nlqResultData.length
  });

  // Define logical color scales for each layer type
  const battleColorScale = [
    [128, 0, 0],      // Dark Red
    [178, 34, 34],    // Firebrick
    [205, 92, 92],    // Indian Red
    [220, 120, 120],  // Light Red
    [233, 150, 150],  // Lighter Red
    [255, 200, 200]   // Very Light Red
  ];

  const explosionColorScale = [
    [153, 76, 0],     // Dark Orange
    [204, 102, 0],    // Orange-Brown
    [255, 128, 0],    // Dark Orange
    [255, 153, 51],   // Medium Orange
    [255, 178, 102],  // Light Orange
    [255, 204, 153]   // Very Light Orange
  ];

  const viirsColorScale = [
    [0, 100, 0],      // Dark Green
    [34, 139, 34],    // Forest Green
    [60, 179, 113],   // Medium Sea Green
    [124, 205, 124],  // Light Green
    [173, 223, 173],  // Lighter Green
    [224, 255, 224]   // Very Light Green
  ];
  
  const nlqResultColorScale = [
    [75, 0, 130],     // Indigo
    [106, 90, 205],   // Slate Blue
    [123, 104, 238],  // Medium Slate Blue
    [147, 112, 219],  // Medium Purple
    [153, 153, 255],  // Light Purple
    [204, 204, 255]   // Very Light Purple
  ];

  // Create layer metadata for use in other components
  const layerInfo = {
    battles: {
      id: "battle-layer",
      color: "#8B0000", // Dark red (similar to battleColorScale[0])
      data: battleData,
      visible: showBattlesLayer
    },
    explosions: {
      id: "explosion-layer",
      color: "#FF8C00", // Dark orange (similar to explosionColorScale[2])
      data: explosionData,
      visible: showExplosionsLayer
    },
    viirs: {
      id: "viirs-layer",
      color: "#228B22", // Forest green (similar to viirsColorScale[1])
      data: viirsData,
      visible: showViirsLayer
    },
    nlq_results: {
      id: "nlq-result-layer",
      color: "#4B0082", // Indigo (similar to nlqResultColorScale[0])
      data: nlqResultData,
      visible: true
    }
  };

  // Create layers array
  const layers = [];
  console.time('Layer creation');

  // Calculate data density for proper scaling
  const getElevationScaleForData = (data, baseScale = 25) => {
    if (data.length === 0) return baseScale;
    
    // Normalize based on total event count to maintain proportional height
    // Using a much smaller base scale (25 instead of 100)
    const densityFactor = Math.min(Math.max(filteredData.length / data.length, 0.5), 5);
    return baseScale * densityFactor;
  };

  // Prepare common brushing-related props
  const getBrushingProps = () => {
    if (brushingEnabled && mousePosition && brushingExtension) {
      return {
        brushingRadius,
        brushingEnabled: true,
        extensions: [brushingExtension],
        brushingTarget: 'source'
      };
    }
    return {};
  };

  // Add each layer separately
  // Create battle hexagon layer if we have battle data
  if (battleData.length > 0 && showBattlesLayer) {
    console.log(`Creating battle hexagon layer with ${battleData.length} points`);
    
    const battleElevationScale = getElevationScaleForData(battleData);
    console.log(`Battle elevation scale: ${battleElevationScale}`);
    
    layers.push(
      new HexagonLayer({
        id: "battle-layer",
        data: battleData,
        getPosition: d => [d.longitude, d.latitude],
        radius,
        coverage,
        colorRange: battleColorScale,
        elevationRange: [0, 500],
        elevationScale: battleElevationScale,
        extruded: true,
        pickable: true,
        autoHighlight: true,
        visible: showBattlesLayer,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [150, 0, 0]
        },
        onHover,
        onClick,
        ...getBrushingProps()
      })
    );
  }

  // Create explosion hexagon layer if we have explosion data
  if (explosionData.length > 0 && showExplosionsLayer) {
    console.log(`Creating explosion hexagon layer with ${explosionData.length} points`);
    
    const explosionElevationScale = getElevationScaleForData(explosionData);
    console.log(`Explosion elevation scale: ${explosionElevationScale}`);
    
    layers.push(
      new HexagonLayer({
        id: "explosion-layer",
        data: explosionData,
        getPosition: d => [d.longitude, d.latitude],
        radius,
        coverage,
        colorRange: explosionColorScale,
        elevationRange: [0, 500],
        elevationScale: explosionElevationScale,
        extruded: true,
        pickable: true,
        autoHighlight: true,
        visible: showExplosionsLayer,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [200, 100, 0]
        },
        onHover,
        onClick,
        ...getBrushingProps()
      })
    );
  }

  // Create VIIRS hexagon layer if we have VIIRS data
  if (viirsData.length > 0 && showViirsLayer) {
    console.log(`Creating VIIRS hexagon layer with ${viirsData.length} points`);
    
    const viirsElevationScale = getElevationScaleForData(viirsData);
    console.log(`VIIRS elevation scale: ${viirsElevationScale}`);
    
    layers.push(
      new HexagonLayer({
        id: "viirs-layer",
        data: viirsData,
        getPosition: d => [d.longitude, d.latitude],
        radius,
        coverage,
        colorRange: viirsColorScale,
        elevationRange: [0, 500],
        elevationScale: viirsElevationScale,
        extruded: true,
        pickable: true,
        autoHighlight: true,
        visible: showViirsLayer,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [0, 150, 0]
        },
        onHover,
        onClick,
        ...getBrushingProps()
      })
    );
  }
  
  // Create NLQ results layer if we have data
  if (nlqResultData.length > 0) {
    console.log(`Creating NLQ results layer with ${nlqResultData.length} points`);
    
    const nlqElevationScale = getElevationScaleForData(nlqResultData);
    console.log(`NLQ results elevation scale: ${nlqElevationScale}`);
    
    layers.push(
      new HexagonLayer({
        id: "nlq-result-layer",
        data: nlqResultData,
        getPosition: d => [d.longitude, d.latitude],
        radius,
        coverage,
        colorRange: nlqResultColorScale,
        elevationRange: [0, 500],
        elevationScale: nlqElevationScale,
        extruded: true,
        pickable: true,
        autoHighlight: true,
        visible: true,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [106, 90, 205]
        },
        onHover,
        onClick,
        ...getBrushingProps()
      })
    );
  }

  console.timeEnd('Layer creation');
  
  // Report total time
  const endTime = performance.now();
  console.log(`Total layer creation time: ${(endTime - startTime).toFixed(2)}ms`);
  
  console.log(`Total layers created: ${layers.length}`);
  return { 
    layers,
    layerInfo
  };
};
