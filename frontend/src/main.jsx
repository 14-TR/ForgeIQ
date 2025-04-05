import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the Map Provider
import { MapProvider } from '../context/MapProvider.jsx'; // Path relative to src/

// Import the main page component
import DeckMap from '../pages/deck-map.jsx'; // Path relative to src/

// Optional: Import global CSS or MUI baseline if needed
// import './index.css'; 

// Find the root element in index.html
const rootElement = document.getElementById('root');

// Create a React root and render the app
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MapProvider> {/* Wrap the main component with the provider */}
        <DeckMap />
        {/* You could also have an <App /> component here that renders DeckMap or handles routing */}
      </MapProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has a div with id='root'.");
} 