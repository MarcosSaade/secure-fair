import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { users } from './users';
import { organizations } from './organization';
import logo from './Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Find user in database
      const userFound = users.find(
        (user) =>
          user.username === formData.username &&
          user.password === formData.password
      );

      if (!userFound) {
        setGeneralError('Credenciales incorrectas. Intenta de nuevo.');
        setIsLoading(false);
        return;
      }

      // Check if user is allowed to login (only socio or admin)
      if (userFound.type !== 'socio' && userFound.type !== 'admin') {
        setGeneralError(
          'Solo socio-formadores y administradores pueden ingresar aquí. Los estudiantes deben crear una cuenta.'
        );
        setIsLoading(false);
        return;
      }

      // Store session básica
      sessionStorage.setItem('username', userFound.username);
      sessionStorage.setItem('type', userFound.type);
      sessionStorage.setItem('user', JSON.stringify(userFound));

      // Si es socio, usar orgId directamente del user
      if (userFound.type === 'socio') {
        const orgFound = Object.values(organizations).find(
          (org) => org.orgID === userFound.orgID
        );

        if (orgFound) {
          sessionStorage.setItem('organization', JSON.stringify(orgFound));
        }

        // Redirección dinámica con ID
        return navigate(`/socio/main_pageSocio/${userFound.orgID}`);
      }

      // Si es admin
      if (userFound.type === 'admin') {
        return navigate('/admin');
      }

      // Otros roles
      navigate(`/${userFound.type}`);
    } catch (error) {
      setGeneralError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: { xs: 80, sm: 120 },
                height: 'auto',
                objectFit: 'contain',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: theme.palette.primary.main,
              mb: 1,
              fontWeight: 700,
            }}
          >
            Feria del Servicio Social
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              fontWeight: 500,
            }}
          >
            Inicia sesión como socio-formador o administrador
          </Typography>

          {/* General Error Alert */}
          {generalError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {generalError}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Username Field */}
            <TextField
              fullWidth
              label="Nombre de usuario"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
              margin="normal"
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading}
                    size="small"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            {/* Sign Up Link */}
            <Button
              fullWidth
              variant="text"
              disabled={isLoading}
              onClick={() => navigate('/SignIn')}
              sx={{
                color: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}10`,
                },
              }}
            >
              ¿Eres estudiante? Crea una cuenta primero
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;