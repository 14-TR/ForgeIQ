import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * MapTooltip - A tooltip component for displaying information about map objects
 * @param {Object} info - The hover/click info object from deck.gl
 */
const MapTooltip = ({ info }) => {
  if (!info || !info.object) return null;

  const { object } = info;
  
  // For hexagon aggregations
  if (info.layer && info.layer.id === 'hexagon-layer') {
    const count = object.points ? object.points.length : 0;
    
    return (
      <Paper 
        elevation={3}
        sx={{
          position: 'absolute',
          zIndex: 1000,
          pointerEvents: 'none',
          left: info.x,
          top: info.y,
          padding: '8px 12px',
          borderRadius: '4px',
          maxWidth: '300px',
          backgroundColor: 'rgba(32, 32, 32, 0.9)',
          color: 'white',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Hexagon Cluster
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">
            Events: {count}
          </Typography>
          <Typography variant="body2">
            Center: {object.position[1].toFixed(4)}, {object.position[0].toFixed(4)}
          </Typography>
          {object.colorValue && (
            <Typography variant="body2">
              Density: {object.colorValue.toFixed(2)}
            </Typography>
          )}
        </Box>
        {count > 0 && object.points && object.points.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Top Events:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, pt: 0.5 }}>
              {object.points.slice(0, 3).map((point, i) => (
                <Box component="li" key={i} sx={{ fontSize: '0.75rem' }}>
                  {point.event_type || 'Event'} - {point.location || 'Unknown location'}
                </Box>
              ))}
            </Box>
            {object.points.length > 3 && (
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                ...and {object.points.length - 3} more
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  }
  
  // For individual events (if you add a ScatterplotLayer or similar)
  return (
    <Paper 
      elevation={3}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'none',
        left: info.x,
        top: info.y,
        padding: '8px 12px',
        borderRadius: '4px',
        maxWidth: '300px',
        backgroundColor: 'rgba(32, 32, 32, 0.9)',
        color: 'white',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {object.event_type || 'Event'}
      </Typography>
      <Box>
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
        {object.description && (
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem' }}>
            {object.description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default MapTooltip; 