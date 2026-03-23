import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
} from "@mui/material";

const StudentRegister = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const username = sessionStorage.getItem('username');

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    matricula: "",
    carrera: "",
    correo: "",
    celular: "",
    hora: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for matricula - A followed by 8 digits (total 9 chars)
    if (name === 'matricula') {
      // Allow only uppercase A followed by digits, max 9 characters total
      if (value === '' || /^A[0-9]*$/.test(value)) {
        if (value.length <= 9) {
          setFormData({
            ...formData,
            [name]: value.toUpperCase(),
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const horasDisponibles = [
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
  ];

  const validateForm = () => {
    const newErrors = {};

    // Nombre validation
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Apellidos validation
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    // Matrícula validation - must be exactly 9 characters: A + 8 digits (e.g., A01659876)
    if (!formData.matricula.trim()) {
      newErrors.matricula = 'La matrícula es requerida';
    } else if (formData.matricula.length !== 9) {
      newErrors.matricula = 'La matrícula debe tener exactamente 9 caracteres (ej: A01659876)';
    } else if (!/^A[0-9]{8}$/.test(formData.matricula)) {
      newErrors.matricula = 'La matrícula debe ser: A seguido de 8 dígitos (ej: A01659876)';
    }

    // Carrera validation
    if (!formData.carrera.trim()) {
      newErrors.carrera = 'La carrera es requerida';
    }

    // Correo validation - must not contain @tec
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    } else if (formData.correo.includes('@tec')) {
      newErrors.correo = 'No se permite usar correos institucionales (@tec)';
    }

    // Celular validation
    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    }

    // Hora validation
    if (!formData.hora.trim()) {
      newErrors.hora = 'Debe seleccionar una hora';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    // Get existing student data from sessionStorage (if any)
     const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    
     // Check if matricula is used by another student
      const matriculaRepetida = Object.values(studentAccounts).some(
        (student) => student.matricula === formData.matricula
      );

      if (matriculaRepetida) {
        setErrors((prev) => ({
          ...prev,
          matricula: 'Esta matrícula ya está asociada a otra cuenta',
        }));
        return;
      }

    // Create student object - combine nombre y apellidos
    const studentData = {
      user_id: Date.now(),
      username: username,
      nombre: `${formData.nombre} ${formData.apellidos}`,
      nombre_solo: formData.nombre,
      matricula: formData.matricula,
      carrera: formData.carrera,
      correo: formData.correo,
      celular: formData.celular,
      hora_registro: formData.hora,
      project_id: null,
      orgID: null,
      registered_at: new Date().toISOString().split('T')[0],
      checked_in_at: null,
    };

    // Save to sessionStorage
    sessionStorage.setItem('studentData', JSON.stringify(studentData));

    // Also save to localStorage for persistence
    studentAccounts[username] = {
      ...studentAccounts[username],
      ...studentData,
    };
    localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));

    navigate("/student/qr");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Registro Estudiantil
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              mb: 3,
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
            }}
          >
            Esta información será usada únicamente para realizar el pre-registro.
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Nombre */}
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Ej: Juan"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Apellidos */}
            <TextField
              label="Apellidos"
              name="apellidos"
              fullWidth
              value={formData.apellidos}
              onChange={handleChange}
              error={!!errors.apellidos}
              helperText={errors.apellidos}
              placeholder="Ej: Pérez García"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Matrícula */}
            <TextField
              label="Matrícula"
              name="matricula"
              fullWidth
              value={formData.matricula}
              onChange={handleChange}
              error={!!errors.matricula}
              helperText={errors.matricula || 'Formato: A01659876 (9 caracteres totales)'}
              placeholder="A01659876"
              inputProps={{ maxLength: 9, style: { textTransform: 'uppercase' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Carrera */}
            <TextField
              label="Carrera"
              name="carrera"
              fullWidth
              value={formData.carrera}
              onChange={handleChange}
              error={!!errors.carrera}
              helperText={errors.carrera}
              placeholder="Ej: Ingeniería en Sistemas"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Correo */}
            <TextField
              label="Correo alterno"
              name="correo"
              type="email"
              fullWidth
              value={formData.correo}
              onChange={handleChange}
              error={!!errors.correo}
              helperText={errors.correo || 'No se permite @tec'}
              placeholder="ejemplo@gmail.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Celular */}
            <TextField
              label="Celular"
              name="celular"
              fullWidth
              value={formData.celular}
              onChange={handleChange}
              error={!!errors.celular}
              helperText={errors.celular}
              placeholder="Ej: +1 (555) 123-4567"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Hora de Registro */}
            <TextField
              select
              label="Hora de registro"
              name="hora"
              fullWidth
              value={formData.hora}
              onChange={handleChange}
              error={!!errors.hora}
              helperText={errors.hora}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                },
              }}
            >
              <MenuItem value="">
                <em>Selecciona una hora</em>
              </MenuItem>
              {horasDisponibles.map((hora) => (
                <MenuItem key={hora} value={hora}>
                  {hora}
                </MenuItem>
              ))}
            </TextField>

            {/* Continue Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentRegister;