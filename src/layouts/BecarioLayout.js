import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Typography,
  useMediaQuery,
  ListItemIcon, // Added ListItemIcon import
  ListItemText, // Added ListItemText import
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import logo from 'pages/Logo.png' // Assuming Logo.png is in the same directory as AdminLayout.tsx

const BecarioLayout = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [anchorProfile, setAnchorProfile] = useState(null)

  const username = sessionStorage.getItem('username') || 'Becario'

  const handleProfileOpen = (e) => {
    setAnchorProfile(e.currentTarget)
  }

  const handleProfileClose = () => {
    setAnchorProfile(null)
  }

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
    handleProfileClose()
  }

  const goToProfile = () => {
    navigate('/becario/profile')
    handleProfileClose()
  }

  const goBack = () => {
    navigate(-1)
  }

  const showBackButton =
    location.pathname !== '/becario'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* AppBar estilo Student */}
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
          {/* Back Button Mobile */}
          {isMobile && showBackButton && (
            <IconButton onClick={goBack} sx={{ mr: 1 }}>
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
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => navigate('/becario')}
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
            Panel de Becario
          </Typography>

          {/* Back Button Desktop */}
          {!isMobile && showBackButton && (
            <IconButton onClick={goBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Avatar */}
          <IconButton
            onClick={handleProfileOpen}
            sx={{
              p: 0.5,
              '&:hover': { opacity: 0.9 },
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.paper,
                fontWeight: 700,
                fontSize: '1.3rem',
                boxShadow: `0 2px 8px ${theme.palette.secondary.main}40`,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          {/* Menu */}
          <Menu
            anchorEl={anchorProfile}
            open={Boolean(anchorProfile)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'end',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'end',
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

            <MenuItem onClick={goToProfile} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <PersonIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: theme.palette.error.main }} />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>
                Cerrar Sesión
              </ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          px: 0,
          pt: 0, // Changed from py to pt: 0
          pb: isMobile ? 2 : 3, // Preserve bottom padding
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default BecarioLayout