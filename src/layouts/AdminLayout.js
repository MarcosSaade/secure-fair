import React from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ bgcolor: 'primary.main' }}
      >
        <Toolbar sx={{ px: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box 
        component="main" 
        sx={{ 
          flex: 1, 
          p: 4,
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
