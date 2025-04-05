import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * MapTooltip - A tooltip component for displaying information about map objects (non-hexagon)
 * @param {Object} info - The hover/click info object from deck.gl
 */
const MapTooltip = ({ info }) => {
  // If no info or object, or if it's explicitly a hexagon layer (handled by HexagonPopup), return null
  if (!info || !info.object || (info.layer && info.layer.id.includes('-layer'))) {
       return null;
   }

  const { object } = info;

  // Logic only for individual events (if you add a ScatterplotLayer or similar)
  // Or for other non-hexagon layer types in the future
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'none', // Tooltips shouldn't be interactive
        left: info.x + 15, // Offset slightly from cursor
        top: info.y + 15, // Offset slightly from cursor
        padding: '8px 12px',
        borderRadius: '4px',
        maxWidth: '300px',
        backgroundColor: 'rgba(32, 32, 32, 0.9)',
        color: 'white',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {object.event_type || 'Feature Info'} {/* More generic title */}
      </Typography>
      <Box>
        {/* Display common properties, adapt as needed */}
        {object.location && (
          <Typography variant="body2">
            Location: {object.location}
          </Typography>
        )}
        {object.event_date && (
          <Typography variant="body2">
            Date: {new Date(object.event_date).toLocaleDateString()}
          </Typography>
        )}
         {object.fatalities !== undefined && (
           <Typography variant="body2">
             Fatalities: {object.fatalities}
           </Typography>
         )}
        {object.name && ( // Example for generic features
            <Typography variant="body2">
                Name: {object.name}
            </Typography>
        )}
        {object.description && (
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem' }}>
            {object.description}
          </Typography>
        )}
         {/* Add a fallback if no specific fields are recognized */}
         {!object.event_type && !object.name && !object.location && (
             <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                 (No specific details available)
             </Typography>
         )}
      </Box>
    </Paper>
  );
};

export default MapTooltip; 