import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the Map Provider
import { MapProvider } from '../context/MapProvider.jsx'; // Path relative to src/

// Import the main App component
import App from './App.jsx'; 

// Optional: Import global CSS or MUI baseline if needed
// import './index.css'; 

// Find the root element in index.html
const rootElement = document.getElementById('root');

// Create a React root and render the app
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MapProvider> {/* Provider now wraps App */}
        <App />
      </MapProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has a div with id='root'.");
} 