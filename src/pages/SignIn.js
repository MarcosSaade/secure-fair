import React, { useState } from 'react';

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from './Logo.png';

const SignIn = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (event, newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!role) return setError('Selecciona un rol');
    if (!username.trim()) return setError('Username requerido');
    if (!password) return setError('Password requerido');

    sessionStorage.setItem('selectedRole', role);
    sessionStorage.setItem('username', username);

    if (role === 'student') {
      navigate('/student');;
    } else if (role === 'socio') {
      navigate('/socio');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2479bd 0%, #1b5f94 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: '#ffffff',
          }}
        >
          {/* LOGO */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo Feria Servicio Social"
              sx={{
                width: 120,
                height: 'auto',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            sx={{ color: '#2479bd', mb: 1 }}
          >
            Feria del Servicio Social
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Crear Cuenta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 2 }}
            >
              Selecciona tu rol
            </Typography>

            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              fullWidth
              sx={{
                mb: 3,
                '& .MuiToggleButton-root.Mui-selected': {
                  backgroundColor: '#2479bd',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1b5f94',
                  },
                },
              }}
            >
              <ToggleButton value="student">Estudiante</ToggleButton>
              <ToggleButton value="socio">Socio-Formador</ToggleButton>
              <ToggleButton value="admin">Administrador</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#2479bd',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#1b5f94',
                },
              }}
            >
              Crear Cuenta
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{
                mt: 2,
                color: '#2479bd',
                textTransform: 'none',
              }}
              onClick={() => navigate('/login')}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;