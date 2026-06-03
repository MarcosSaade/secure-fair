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
import logo from './Logo.png';
import * as storageService from '../services/StorageService';


const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    contraseña: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.contraseña.trim()) newErrors.contraseña = 'La contraseña es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const apiBase = `/api`;
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.username,
          password: formData.contraseña,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      const userData = data.data;
      const role = userData.role || userData.tipo;

      sessionStorage.setItem('username', userData.username);
      sessionStorage.setItem('tipo', role);
      sessionStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) sessionStorage.setItem('token', userData.token);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'becario') {
        navigate('/becario');
      } else if (role === 'socio') {
        const orgId = userData.org_id || userData.id_organizacion;
        navigate(`/socio/main_pageSocio/${orgId}`);
      } else if (role === 'student') {
        // Fetch student profile from API to populate studentData
        try {
          const stuRes = await fetch(`${apiBase}/students/${userData.id}`);
          const stuData = await stuRes.json();
          if (stuData.success) {
            sessionStorage.setItem('studentData', JSON.stringify(stuData.data));
          }
        } catch (_) { /* profile not created yet, that's ok */ }
        navigate('/student/qr');
      } else {
        throw new Error('Rol no reconocido: ' + role);
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError(error.message || 'Ocurrió un error. Intenta de nuevo.');
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
                '&:hover': { transform: 'scale(1.05)' },
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{ color: theme.palette.primary.main, mb: 1, fontWeight: 700 }}
          >
            Feria del Servicio Social
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            align="center"
            sx={{ color: theme.palette.text.secondary, mb: 4, fontWeight: 500 }}
          >
            Inicia sesión con tu cuenta
          </Typography>

          {/* General Error Alert */}
          {generalError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
              {generalError}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
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

            <TextField
              fullWidth
              label="Contraseña"
              name="contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.contraseña}
              onChange={handleInputChange}
              error={!!errors.contraseña}
              helperText={errors.contraseña}
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
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mb: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <Button
              fullWidth
              variant="text"
              disabled={isLoading}
              onClick={() => navigate('/SignIn')}
              sx={{
                color: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: `${theme.palette.primary.main}10` },
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