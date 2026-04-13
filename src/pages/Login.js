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

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', formData.username);
      console.log('Password:', formData.contraseña);

      // 1. Check localStorage for updated admin credentials
      const admins = storageService.getAdmins();
      console.log('Admins from storage:', admins);
      
      const adminFound = admins.find(
        (admin) =>
          admin.username === formData.username &&
          admin.contraseña === formData.contraseña
      );

      if (adminFound) {
        console.log('✅ Admin found:', adminFound);
        sessionStorage.setItem('username', adminFound.username);
        sessionStorage.setItem('tipo', 'admin');
        sessionStorage.setItem('user', JSON.stringify(adminFound));
        return navigate('/admin');
      }

      // Check localSorage for updated becario credentials
     const becarios = storageService.getUsuarios().filter(user => user.tipo === 'becario');
      console.log('Becarios from storage:', becarios);
      const becarioFound = becarios.find(
     (becario) =>
          becario.username === formData.username &&
          becario.contraseña === formData.contraseña
      );

      if (becarioFound) {
        sessionStorage.setItem('username', becarioFound.username);
        sessionStorage.setItem('tipo', 'becario');
        sessionStorage.setItem('user', JSON.stringify(becarioFound));
        return navigate('/becario');
      }


      // 2. Check localStorage for updated socio credentials
      const sociosRaw = localStorage.getItem('socios');
      console.log('Raw socios from localStorage:', sociosRaw);
      
      let socios = [];
      if (sociosRaw) {
        const parsed = JSON.parse(sociosRaw);
        socios = Array.isArray(parsed) ? parsed : Object.values(parsed);
      }
      console.log('Socios array:', socios);

      const socioFound = socios.find(
        (socio) =>
          socio.username === formData.username &&
          socio.contraseña === formData.contraseña
      );

      if (socioFound) {
        console.log('✅ Socio found:', socioFound);
        const organizaciones = storageService.getOrganizaciones();
        const orgFound = organizaciones.find(
          (org) => org.id_organizacion === socioFound.id_organizacion
        );
        if (orgFound) {
          sessionStorage.setItem('organization', JSON.stringify(orgFound));
        }
        sessionStorage.setItem('username', socioFound.username);
        sessionStorage.setItem('tipo', 'socio');
        sessionStorage.setItem('user', JSON.stringify(socioFound));
        return navigate(`/socio/main_pageSocio/${socioFound.id_organizacion}`);
      }

      // 3. Check localStorage for student credentials
      const usuarios = storageService.getUsuarios();
      console.log('Usuarios from storage:', usuarios);
      
      const usuarioReal = usuarios.find(
        (user) =>
          user.username === formData.username &&
          user.contraseña === formData.contraseña
      );

      if (usuarioReal) {
        console.log('Usuario found:', usuarioReal);
        if (usuarioReal.tipo === 'student') {
          const estudiantes = storageService.getEstudiantes();
          const studentData = estudiantes.find(
            (est) => est.id_usuario === usuarioReal.id_usuario
          );

          sessionStorage.setItem('username', usuarioReal.username);
          sessionStorage.setItem('tipo', 'student');
          sessionStorage.setItem('user', JSON.stringify(usuarioReal));
          sessionStorage.setItem(
            'studentData',
            JSON.stringify(studentData || {})
          );
          return navigate('/student/qr');
        }
      }

      console.log('❌ No user found');
      setGeneralError('Credenciales incorrectas. Intenta de nuevo.');
    } catch (error) {
      console.error('Login error:', error);
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