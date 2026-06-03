import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";

import * as storageService from '../../services/StorageService';

const StudentRegister = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const id_usuario = user?.id_usuario || user?.id;
      if (!id_usuario) return;
      
      try {
        const apiBase = `/api`;
        const res = await fetch(`${apiBase}/students/${id_usuario}`);
        const result = await res.json();
        
        if (result.success && result.data) {
          const student = result.data;
          
          // Pre-fill the form
          setFormData({
            nombre: student.nombre || student.full_name?.split(' ')[0] || "",
            apellidos: student.apellidos || student.full_name?.split(' ').slice(1).join(' ') || "",
            matricula: student.matricula || "",
            carrera: student.carrera || "",
            correo: student.correo_personal || student.correo || "",
            celular: student.celular || student.phone || "",
            hora: student.hora_registro || "",
          });

          storageService.saveEstudiante(student);
          sessionStorage.setItem("studentData", JSON.stringify(student));

          // Auto-routing logic for returning students
          if (student.enrollments && student.enrollments.length > 0) {
            navigate("/student/slots");
            return;
          }
          if (student.checked_in_at) {
             navigate("/student/slots");
             return;
          }
          if (student.matricula) {
             navigate("/student/qr");
          }
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };
    fetchStudentData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'matricula') {
      if (value === '' || /^A[0-9]*$/.test(value)) {
        if (value.length <= 9) {
          setFormData({ ...formData, [name]: value.toUpperCase() });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (generalError) setGeneralError('');
  };

  const horasDisponibles = [
    "7:00 AM", "8:00 AM", "8:30 AM", "9:00 AM",
    "9:30 AM", "10:00 AM", "10:30 AM",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';

    if (!formData.matricula.trim()) {
      newErrors.matricula = 'La matrícula es requerida';
    } else if (formData.matricula.length !== 9) {
      newErrors.matricula = 'La matrícula debe tener exactamente 9 caracteres (ej: A01659876)';
    } else if (!/^A[0-9]{8}$/.test(formData.matricula)) {
      newErrors.matricula = 'La matrícula debe ser: A seguido de 8 dígitos (ej: A01659876)';
    }

    if (!formData.carrera.trim()) newErrors.carrera = 'La carrera es requerida';

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    } else if (formData.correo.includes('@tec')) {
      newErrors.correo = 'No se permite usar correos institucionales (@tec)';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'El celular debe contener exactamente 10 dígitos';
    }

    if (!formData.hora.trim()) newErrors.hora = 'Debe seleccionar una hora';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const user = JSON.parse(sessionStorage.getItem("user"));
    const id_usuario = user?.id_usuario || user?.id;
    const username = user?.username;

    if (!id_usuario) {
      setGeneralError("No se encontró el usuario en sesión. Por favor inicia sesión nuevamente.");
      return;
    }

    const studentData = {
      id_usuario,
      username,
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      full_name: `${formData.nombre} ${formData.apellidos}`.trim(),
      matricula: formData.matricula,
      carrera: formData.carrera,
      correo: formData.correo,
      celular: formData.celular,
      phone: formData.celular,
      hora_registro: formData.hora,
      registered_at: new Date().toISOString().split("T")[0],
    };

    // === GUARDAR EN BASE DE DATOS PRIMERO (fuente de la verdad) ===
    // El PUT /students/:id hace upsert: actualiza si existe, crea si no existe.
    setSaving(true);
    try {
      const apiBase = `/api`;

      const putRes = await fetch(`${apiBase}/students/${id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const putResult = await putRes.json();

      if (!putResult.success) {
        setSaving(false);
        // P2002 = unique constraint (matricula duplicada en OTRA cuenta real)
        if (putResult.message?.includes('matrícula ya existe') || putResult.message?.includes('P2002') || putResult.message?.includes('unique')) {
          setErrors(prev => ({ ...prev, matricula: "Esta matrícula ya está registrada en otra cuenta. Usa tu matrícula correcta." }));
        } else {
          setGeneralError(`Error al guardar perfil: ${putResult.message}`);
        }
        return; // No navegar
      }

      console.log('✅ Perfil de estudiante guardado en DB:', putResult.data);
    } catch (err) {
      setSaving(false);
      console.error('❌ Error de conexión al backend:', err);
      setGeneralError('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en el puerto 8000.');
      return;
    }

    setSaving(false);

    // Guardar en localStorage como caché DESPUÉS de guardar en DB exitosamente
    storageService.saveEstudiante(studentData);
    sessionStorage.setItem("studentData", JSON.stringify(studentData));

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
            sx={{ mb: 3, color: theme.palette.text.secondary, fontSize: '0.95rem' }}
          >
            Esta información será guardada en la base de datos para que pueda ser verificada desde cualquier dispositivo.
          </Typography>

          {generalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Ej: Juan"
            />

            <TextField
              label="Apellidos"
              name="apellidos"
              fullWidth
              value={formData.apellidos}
              onChange={handleChange}
              error={!!errors.apellidos}
              helperText={errors.apellidos}
              placeholder="Ej: Pérez García"
            />

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
            />

            <TextField
              label="Carrera"
              name="carrera"
              fullWidth
              value={formData.carrera}
              onChange={handleChange}
              error={!!errors.carrera}
              helperText={errors.carrera}
              placeholder="Ej: Ingeniería en Sistemas"
            />

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
            />

            <TextField
              label="Celular"
              name="celular"
              fullWidth
              value={formData.celular}
              onChange={handleChange}
              error={!!errors.celular}
              helperText={errors.celular}
              placeholder="Ej: 8181234567"
            />

            <TextField
              select
              label="Hora de registro"
              name="hora"
              fullWidth
              value={formData.hora}
              onChange={handleChange}
              error={!!errors.hora}
              helperText={errors.hora}
            >
              <MenuItem value=""><em>Selecciona una hora</em></MenuItem>
              {horasDisponibles.map((hora) => (
                <MenuItem key={hora} value={hora}>{hora}</MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={saving}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.paper,
                "&:hover": { backgroundColor: theme.palette.secondary.dark },
              }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : "Continuar"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentRegister;