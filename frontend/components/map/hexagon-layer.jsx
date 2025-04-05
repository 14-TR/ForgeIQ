import React from "react";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { colorRange } from "../utils/map-config";

const HexagonLayerComponent = ({ data, radius, upperPercentile, coverage }) => {
  return new HexagonLayer({
    id: "heatmap",
    gpuAggregation: true,
    colorRange,
    coverage,
    data,
    elevationRange: [0, 3000],
    elevationScale: data && data.length ? 50 : 0,
    extruded: true,
    getPosition: (d) => d,
    pickable: true,
    radius,
    upperPercentile,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
    transitions: {
      elevationScale: 3000,
    },
  });
};

export default HexagonLayerComponent;
