/**
 * LoginPage
 *
 * Full-page login form that authenticates against the Secure Fair API.
 * On success, redirects the user to their role-specific dashboard.
 */

import { useState, FormEvent } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate, Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.SOCIO]: '/socio',
  [UserRole.STUDENT]: '/student',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect to role home
  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role as UserRole] ?? '/login'} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Ingresa tu correo electrónico.');
    if (!password) return setError('Ingresa tu contraseña.');

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      // useAuth updates user; read role from the freshly stored user
      const stored = JSON.parse(localStorage.getItem('secure_fair_user') ?? 'null');
      const home = stored?.role ? ROLE_HOME[stored.role as UserRole] : '/';
      navigate(home ?? '/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
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
          {/* Header */}
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Secure Fair
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sistema de Registro para Ferias de Servicio Social
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              placeholder="nombre@dominio.com"
              helperText="Ejemplo: nombre@dominio.com"
              sx={{ mb: 2 }}
              autoComplete="email"
              autoFocus
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            <Button component={RouterLink} to="/register/student" fullWidth variant="text" sx={{ mt: 1 }}>
              Registrarme como estudiante
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
