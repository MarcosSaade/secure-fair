import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from './Logo.png';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Ingresa tu correo');
    if (!password) return setError('Ingresa tu contraseña');

    setLoading(true);
    try {
      // Authenticate against the real backend
      const tokenRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password,
      });
      const { access_token } = tokenRes.data;

      // Store JWT token
      localStorage.setItem('access_token', access_token);

      // Fetch user profile to determine role
      const meRes = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = meRes.data;
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'SOCIO') {
        navigate('/socio');
      } else if (user.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Error al iniciar sesión';
      setError(detail);
    } finally {
      setLoading(false);
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
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4 }}>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ width: 110 }}
            />
          </Box>

          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            sx={{ color: '#2479bd', mb: 4 }}
          >
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;