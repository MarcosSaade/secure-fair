import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import logo from 'pages/Logo.png';
/**
 * StudentLayout
 * 
 * Mobile-first layout for student registration flow.
 * Optimized for phone use with larger touch targets.
 */
const StudentLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorProfile, setAnchorProfile] = useState(null);

  // Get user info from sessionStorage
  const username = sessionStorage.getItem('username') || 'Estudiante';

  // Handle profile menu
  const handleProfileOpen = (e) => {
    setAnchorProfile(e.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorProfile(null);
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
    handleProfileClose();
  };

  // Navigate to profile
  const goToProfile = () => {
    navigate('/student/profile');
    handleProfileClose();
  };

  // Navigate back
  const goBack = () => {
    navigate(-1);
  };

  // Determine if back button should show
  const showBackButton =
    location.pathname !== '/student' && location.pathname !== '/student/register';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header AppBar */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: `0 2px 8px ${theme.palette.primary.main}15`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Back Button - Mobile */}
          {isMobile && showBackButton && (
            <IconButton
              onClick={goBack}
              sx={{
                mr: 1,
                color: theme.palette.text.primary,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: isMobile ? 40 : 50,
              cursor: 'pointer',
              mr: isMobile ? 1 : 2,
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate('/student')}
          />

          {/* Title */}
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mr: 'auto',
              fontSize: isMobile ? '1rem' : '1.25rem',
            }}
          >
            Feria Social
          </Typography>

          {/* Back Button - Desktop */}
          {!isMobile && showBackButton && (
            <IconButton
              onClick={goBack}
              sx={{
                mr: 1,
                color: theme.palette.text.primary,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Profile Avatar Button - Yellow Circle */}
          <IconButton
            onClick={handleProfileOpen}
            sx={{
              p: 0.5,
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.paper,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1.3rem',
                boxShadow: `0 2px 8px ${theme.palette.secondary.main}40`,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorProfile}
            open={Boolean(anchorProfile)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: '200px',
                },
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {username}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={goToProfile}
              sx={{
                py: 1.5,
              }}
            >
              <PersonIcon sx={{ mr: 1.5, color: theme.palette.secondary.main }} />
              <Typography>Mi Perfil</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, color: theme.palette.error.main }} />
              <Typography sx={{ color: theme.palette.error.main }}>
                Cerrar Sesión
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 3,
          overflowY: 'auto',
        }}
      >
        <Container maxWidth={isMobile ? 'sm' : 'lg'} disableGutters={isMobile}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default StudentLayout;