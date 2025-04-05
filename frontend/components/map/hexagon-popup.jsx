import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * HexagonPopup - A popup component for displaying aggregated data for a clicked hexagon
 * @param {Object} info - The click info object from deck.gl
 * @param {Function} onClose - Callback function to close the popup
 */
const HexagonPopup = ({ info, onClose }) => {
  // Should only be rendered if info and info.object exist and it's a known hexagon layer
  if (!info || !info.object || !info.layer || !info.layer.id.includes('-layer')) {
       return null;
   }

  const { object } = info;
  const count = object.points ? object.points.length : 0;

  // Determine a representative name for the hexagon based on layer ID
  let layerName = 'Hexagon Cluster';
  if (info.layer.id.includes('battle')) layerName = 'Battle Cluster';
  if (info.layer.id.includes('explosion')) layerName = 'Explosion Cluster';
  if (info.layer.id.includes('viirs')) layerName = 'VIIRS Cluster';
  if (info.layer.id.includes('nlq')) layerName = 'NLQ Result Cluster';

  return (
    <Paper 
      elevation={4} // Slightly higher elevation than tooltips
      sx={{
        position: 'absolute',
        zIndex: 1050, // Above tooltips, potentially below speed dial actions
        // Center the popup roughly based on click coordinates
        // This might need adjustment based on map projection and zoom
        left: `calc(50% + ${info.x - window.innerWidth / 2}px)`,
        top: `calc(50% + ${info.y - window.innerHeight / 2}px)`,
        transform: 'translate(-50%, -50%)', // Center the element
        padding: '16px',
        borderRadius: '8px',
        minWidth: '300px',
        maxWidth: '400px',
        backgroundColor: '#333', // Darker background
        color: 'white',
        pointerEvents: 'auto', // Allow interaction with the popup (e.g., close button)
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)' // Stronger shadow
      }}
    >
       <IconButton 
         aria-label="close popup"
         onClick={onClose}
         sx={{ 
           position: 'absolute', 
           top: 8, 
           right: 8, 
           color: '#aaa', 
           padding: '4px',
           '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
         }}
         size="small"
       >
         <CloseIcon fontSize="inherit" />
       </IconButton>
       
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, pr: '30px' }}> {/* Padding right for close button */}
        {layerName}
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body1">
          Total Events: <strong>{count}</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: '#ccc' }}>
          Center (Lat, Lon): {object.position[1].toFixed(4)}, {object.position[0].toFixed(4)}
        </Typography>
        {object.colorValue !== undefined && (
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Relative Density: {object.colorValue.toFixed(2)}
          </Typography>
        )}
      </Box>
      
      {count > 0 && object.points && object.points.length > 0 && (
        <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: '5px' }}> {/* Scrollable event list */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Sample Events ({Math.min(count, 10)} of {count}):
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, pt: 0.5 }}>
            {object.points.slice(0, 10).map((point, i) => (
              <Box 
                component="li" 
                key={i} 
                sx={{ 
                  fontSize: '0.8rem', 
                  mb: 0.5, 
                  pb: 0.5, 
                  borderBottom: i < Math.min(count, 10) - 1 ? '1px dashed #555' : 'none' // Add divider
                }}
              >
                <strong>{point.event_type || 'Event'}</strong>
                {point.location && <Typography variant="caption" display="block">{point.location}</Typography>}
                {point.event_date && <Typography variant="caption" display="block">{new Date(point.event_date).toLocaleDateString()}</Typography>}
              </Box>
            ))}
          </Box>
          {object.points.length > 10 && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 1, color: '#ccc' }}>
              ...and {object.points.length - 10} more events not shown.
            </Typography>
          )}
        </Box>
      )}
      {count === 0 && (
           <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#aaa' }}>
               No events in this cluster.
           </Typography>
       )}
    </Paper>
  );
};

export default HexagonPopup; 