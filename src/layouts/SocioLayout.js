import React from 'react';

import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

/**
 * SocioLayout
 * 
 * Layout wrapper for socio-formador routes.
 * Provides a dashboard-centered design with global profile access.
 * Main content at /socio, with only /socio/projects/:project_id/code as separate route.
 */

const SocioLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header/AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Socio-Formador Dashboard
          </Typography>
          {/* Profile Icon - TODO: Implement Profile Icon Component */}
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Renders child routes */}
      <Box component="main" sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default SocioLayout;
