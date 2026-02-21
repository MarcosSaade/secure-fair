import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * StudentLayout
 * 
 * Layout wrapper for student routes.
 * Manages the step-by-step registration flow.
 * Keeps profile icon accessible globally.
 */
const StudentLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        py: 2,
      }}
    >
      {/* Header with Profile Icon - TODO: Implement Profile Icon Component */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, mb: 2 }}>
        {/* Profile Icon will go here */}
      </Box>

      {/* Main Content Area - Renders child routes */}
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudentLayout;
