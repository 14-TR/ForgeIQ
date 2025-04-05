// InfoPage.jsx - Moved to components/panels
import React from "react";
import { Box, Typography } from "@mui/material"; // Using MUI

const InfoPage = () => {

  return (
    <Box sx={{ 
        backgroundColor: "#2c2c2c",
        color: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
        minWidth: "300px",
        maxWidth: "500px",
        boxShadow: 3 
    }}>
      <Typography variant="h6" gutterBottom component="h3">
        Information
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        This panel can contain helpful information, such as:
      </Typography>
       <Typography component="ul" sx={{ mt: 1, pl: 2, fontSize: '0.875rem' }}>
            <li>Data source descriptions (ACLED, VIIRS).</li>
            <li>Instructions for using search or brushing.</li>
            <li>Date ranges covered by the fetched data.</li>
            <li>Disclaimers about data accuracy or completeness.</li>
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 2, color: '#aaa' }}>
          (This is placeholder content)
      </Typography>
    </Box>
  );
};

export default InfoPage;
