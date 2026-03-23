import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserRole } from '../types/auth';

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function StudentRegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !fullName.trim() ||
      !email.trim() ||
      !studentId.trim() ||
      !major.trim() ||
      !semester ||
      !password ||
      !confirmPassword
    ) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Ingresa un correo válido con formato nombre@dominio.com');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.registerStudent({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: UserRole.STUDENT,
        student_id_number: studentId.trim(),
        major: major.trim() || undefined,
        semester: semester || undefined,
      });

      setSuccess('Registro completado. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el estudiante');
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
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
            Registro de Estudiante
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              placeholder="nombre@dominio.com"
              helperText="Usa el formato nombre@dominio.com"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Matrícula"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Carrera"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Semestre"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {SEMESTERS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mb: 2 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Crear cuenta'}
            </Button>

            <Button component={RouterLink} to="/login" fullWidth variant="text">
              Ya tengo cuenta
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
