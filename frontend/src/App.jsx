import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import DeckMap from '../pages/deck-map.jsx'; // Adjust path if needed
import ComponentDemo from '../pages/component-demo.jsx';
import { MapProvider } from '../context/MapProvider'; // Import MapProvider
import Header from '../components/core/header.jsx';

// Optional: Import layout components if you have them
// import Footer from '../components/layout/Footer';

function App() {
  const [showDemo, setShowDemo] = useState(false);

  // Cleanup function to remove any event listeners when switching views
  // (Adapted from your example)
  useEffect(() => {
    return () => {
      // This aims to prevent errors from global event handlers 
      // potentially attached by map libraries when views change.
      if (window.controls && window.controls.domElement) {
          console.log("Cleaning up window.controls listeners in App component.");
          window.controls.domElement.onmousemove = null;
          window.controls.domElement.onmousedown = null;
          window.controls.domElement.onmouseup = null;
          window.controls.domElement.onwheel = null;
      }
      // Add any other specific cleanup needed for libraries you use
    };
  }, [showDemo]); // Re-run cleanup if the view toggles

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <Header />
      <MapProvider>
        <Box component="main" sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
          {showDemo ? <ComponentDemo /> : <DeckMap />}
        </Box>
      </MapProvider>
      
      {/* Toggle Button using MUI */}
      <Box sx={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1300 // Ensure it's above map overlays/tooltips 
      }}>
        <Button 
          variant="contained"
          onClick={() => setShowDemo(!showDemo)}
          size="small"
          sx={{ 
              backgroundColor: '#444',
              color: 'white',
              '&:hover': { backgroundColor: '#555' }
          }}
        >
          {showDemo ? 'Show Map' : 'Show Component Demo'}
        </Button>
      </Box>
    </Box>
  );
}

export default App; 