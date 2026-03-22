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

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // 1. Buscar en dummies (socios/admin)
      const userFound = users.find(
        (user) =>
          user.username === formData.username &&
          user.contraseña === formData.contraseña
      );

      if (userFound) {
        if (userFound.tipo === 'socio') {
          const orgFound = organizations.find(
            (org) => org.id_organizacion === userFound.id_organizacion
          );
          if (orgFound) {
            sessionStorage.setItem('organization', JSON.stringify(orgFound));
          }
          sessionStorage.setItem('username', userFound.username);
          sessionStorage.setItem('tipo', 'socio');
          sessionStorage.setItem('user', JSON.stringify(userFound));
          return navigate(`/socio/main_pageSocio/${userFound.id_organizacion}`);
        }

        if (userFound.tipo === 'admin') {
          sessionStorage.setItem('username', userFound.username);
          sessionStorage.setItem('tipo', 'admin');
          sessionStorage.setItem('user', JSON.stringify(userFound));
          return navigate('/admin');
        }
      }

      // 2. Buscar en usuarios reales
      const usuarios = storageService.getUsuarios();
      const usuarioReal = usuarios.find(
        (user) =>
          user.username === formData.username &&
          user.contraseña === formData.contraseña
      );

      if (usuarioReal) {
        if (usuarioReal.tipo === 'socio') {
          const organizaciones = storageService.getOrganizaciones();
          const orgFound = organizaciones.find(
            (org) => org.id_organizacion === usuarioReal.id_organizacion
          );
          if (orgFound) {
            sessionStorage.setItem('organization', JSON.stringify(orgFound));
          }
          sessionStorage.setItem('username', usuarioReal.username);
          sessionStorage.setItem('tipo', 'socio');
          sessionStorage.setItem('user', JSON.stringify(usuarioReal));
          return navigate(`/socio/main_pageSocio/${usuarioReal.id_organizacion}`);
        }

        if (usuarioReal.tipo === 'admin') {
          sessionStorage.setItem('username', usuarioReal.username);
          sessionStorage.setItem('tipo', 'admin');
          sessionStorage.setItem('user', JSON.stringify(usuarioReal));
          return navigate('/admin');
        }

        if (usuarioReal.tipo === 'student') {
          // 3. Buscar datos adicionales en estudiantes por id_usuario
          const estudiantes = storageService.getEstudiantes();
          const studentData = estudiantes.find(
            (est) => est.id_usuario === usuarioReal.id_usuario
          );

          sessionStorage.setItem('username', usuarioReal.username);
          sessionStorage.setItem('tipo', 'student');
          sessionStorage.setItem(
            'studentData',
            JSON.stringify(studentData || {}) // siempre objeto válido
          );
          return navigate('/student/qr');
        }
      }

      // 4. Si no se encontró ningún usuario
      setGeneralError('Credenciales incorrectas. Intenta de nuevo.');
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
