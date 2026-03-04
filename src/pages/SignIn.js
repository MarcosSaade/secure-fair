import React, { useState } from 'react';

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from './Logo.png';

const SignIn = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) return;

    // Guardar sesión como estudiante
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('type', 'student');

    // Redirigir a student
    navigate('/student');
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
          align="center"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Crea tu cuenta como estudiante.
        </Typography>

        <Typography
          align="center"
          sx={{
            mb: 4,
            fontWeight: 700,
            color: '#2479bd',
          }}
        >
          Si eres socio-formador o administrador, inicia sesión con tu cuenta existente.
        </Typography>

          <Box component="form" onSubmit={handleSubmit}>
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