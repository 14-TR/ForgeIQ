import React from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";

const INITIAL_VIEW_STATE = {
  longitude: 30.5234, // Example: Kyiv, Ukraine
  latitude: 50.4501,
  zoom: 6,
  pitch: 0,
  bearing: 0,
};

const MapView = () => {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <Map reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
    </div>
  );
};

export default MapView;
