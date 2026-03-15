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
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import logo from './Logo.png';

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation constants
  const PASSWORD_MIN_LENGTH = 12;


  // Check password requirements
  const checkPasswordRequirements = (password) => {
    return {
      minLength: password.length >= PASSWORD_MIN_LENGTH,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"]/.test(password),
    };
  };

  const isPasswordValid = (password) => {
    if (!password) return false;
    const requirements = checkPasswordRequirements(password);
    return (
      requirements.minLength &&
      requirements.hasUppercase &&
      requirements.hasNumber &&
      requirements.hasSpecial
    );
  };

  const passwordRequirements = checkPasswordRequirements(formData.password);
  const allRequirementsMet = Object.values(passwordRequirements).every(
    (req) => req === true
  );

  const getPasswordStrength = () => {
    const metRequirements = Object.values(passwordRequirements).filter(
      (req) => req === true
    ).length;
    return (metRequirements / 4) * 100;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = 'La contraseña no cumple con los requisitos';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      setTimeout(() => {
        // Create auth data (username + password only)
        const authData = {
          username: formData.username,
          password: formData.password,
          createdAt: new Date().toISOString().split('T')[0],
        };

        // Store auth data in localStorage
        const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
        studentAccounts[formData.username] = {
          ...studentAccounts[formData.username],
          ...authData,
        };
        localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));

        // Store in sessionStorage for current session
        sessionStorage.setItem('username', formData.username);
        sessionStorage.setItem('password', formData.password);
        sessionStorage.setItem('type', 'student');

        setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo...');

        // Redirect after 1.5 seconds
        setTimeout(() => {
          navigate('/student/register');
        }, 1500);
      }, 800);
    } catch (error) {
      setGeneralError('Error al crear la cuenta. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const showPasswordRequirements = formData.password.length > 0 && !allRequirementsMet;

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
              mb: 1,
              fontWeight: 500,
            }}
          >
            Crea tu cuenta como estudiante
          </Typography>

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              bgcolor: `${theme.palette.info.main}15`,
              border: `1px solid ${theme.palette.info.light}`,
              borderRadius: theme.shape.borderRadius,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
              <strong>¿Eres socio-formador o administrador?</strong>
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: theme.palette.text.secondary }}>
              Por favor inicia sesión con tu cuenta existente.
            </Typography>
          </Box>

          {/* Success Alert */}
          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {successMessage}
            </Alert>
          )}

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
                    {showPassword ? <Visibility /> : <VisibilityOff/>}
                  </IconButton>
                ),
              }}
              sx={{ mb: formData.password ? 1 : 2 }}
            />

            {/* Password Requirements */}
            {showPasswordRequirements && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Fortaleza de la contraseña
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getPasswordStrength()}
                    sx={{
                      mt: 0.5,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.divider,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor:
                          getPasswordStrength() < 50
                            ? theme.palette.error.main
                            : getPasswordStrength() < 100
                            ? theme.palette.warning.main
                            : theme.palette.success.main,
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                  <strong>Requisitos:</strong>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                  {passwordRequirements.minLength ? (
                    <Check sx={{ fontSize: 18, color: theme.palette.success.main, mr: 1 }} />
                  ) : (
                    <Close sx={{ fontSize: 18, color: theme.palette.error.main, mr: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Mínimo 12 caracteres
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                  {passwordRequirements.hasUppercase ? (
                    <Check sx={{ fontSize: 18, color: theme.palette.success.main, mr: 1 }} />
                  ) : (
                    <Close sx={{ fontSize: 18, color: theme.palette.error.main, mr: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Al menos una mayúscula
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                  {passwordRequirements.hasNumber ? (
                    <Check sx={{ fontSize: 18, color: theme.palette.success.main, mr: 1 }} />
                  ) : (
                    <Close sx={{ fontSize: 18, color: theme.palette.error.main, mr: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Al menos un número
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {passwordRequirements.hasSpecial ? (
                    <Check sx={{ fontSize: 18, color: theme.palette.success.main, mr: 1 }} />
                  ) : (
                    <Close sx={{ fontSize: 18, color: theme.palette.error.main, mr: 1 }} />
                  )}
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Carácter especial (!@#$%^&*)
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              disabled={isLoading || !allRequirementsMet}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={isLoading || !allRequirementsMet}
                    size="small"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Sign Up Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !allRequirementsMet}
              sx={{
                mb: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            {/* Login Link */}
            <Button
              fullWidth
              variant="text"
              disabled={isLoading}
              onClick={() => navigate('/login')}
              sx={{
                color: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}10`,
                },
              }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;