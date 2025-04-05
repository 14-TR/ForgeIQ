import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";

export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// export const INITIAL_VIEW_STATE = {
//   longitude: -1.415727,
//   latitude: 52.232395,
//   zoom: 6.6,
//   minZoom: 5,
//   maxZoom: 15,
//   pitch: 40.5,
//   bearing: -27,
// };

export const INITIAL_VIEW_STATE = {
  longitude: 30.5234, // Example: Kyiv, Ukraine
  latitude: 50.4501,
  zoom: 6.6,
  minZoom: 5,
  maxZoom:15,
  pitch: 40.5,
  bearing: 0,
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 });

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

export const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });
