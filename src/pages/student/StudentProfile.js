import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { projects } from '../projects';
import { organizations } from '../organization';

const StudentProfile = () => {
  const theme = useTheme();
  const username = sessionStorage.getItem('username');
  
  // Get complete student data from localStorage
  const getStudentData = () => {
    const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    return studentAccounts[username] || null;
  };

  const studentData = getStudentData();

  const [formData, setFormData] = useState({
    // SignUp info
    username: studentData?.username || username || '',
    password: studentData?.password || '',
    // StudentRegister info
    nombre: studentData?.nombre || '',
    matricula: studentData?.matricula || '',
    carrera: studentData?.carrera || '',
    correo: studentData?.correo || '',
    celular: studentData?.celular || '',
    hora_registro: studentData?.hora_registro || '',
    // New password
    newPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get enrolled project
  const enrolledProject = projects.find(p => p.project_id === studentData?.project_id);
  const enrolledOrg = organizations.find(o => o.orgID === enrolledProject?.orgID);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation for registration fields
    if (!formData.nombre.trim()) {
      setMessage({ type: 'error', text: 'El nombre es requerido' });
      return;
    }

    if (!formData.matricula.trim()) {
      setMessage({ type: 'error', text: 'La matrícula es requerida' });
      return;
    }

    if (!formData.carrera.trim()) {
      setMessage({ type: 'error', text: 'La carrera es requerida' });
      return;
    }

    if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      setMessage({ type: 'error', text: 'Email inválido' });
      return;
    }

    if (!formData.celular.trim()) {
      setMessage({ type: 'error', text: 'El celular es requerido' });
      return;
    }

    // If changing password, validate
    if (formData.newPassword.trim()) {
      if (formData.newPassword.length < 12) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 12 caracteres' });
        return;
      }
      if (!/[A-Z]/.test(formData.newPassword)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener mayúsculas' });
        return;
      }
      if (!/[0-9]/.test(formData.newPassword)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener números' });
        return;
      }
      if (!/[!@#$%^&*]/.test(formData.newPassword)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener caracteres especiales' });
        return;
      }
    }

    // Update in localStorage
    const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    studentAccounts[username] = {
      ...studentAccounts[username],
      // Keep SignUp info
      username: formData.username,
      password: formData.newPassword || formData.password, // Use new password if changed
      // Update StudentRegister info
      nombre: formData.nombre,
      matricula: formData.matricula,
      carrera: formData.carrera,
      correo: formData.correo,
      celular: formData.celular,
      hora_registro: formData.hora_registro,
    };
    localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));

    // Update sessionStorage
    sessionStorage.setItem('studentData', JSON.stringify(studentAccounts[username]));
    if (formData.newPassword) {
      sessionStorage.setItem('password', formData.newPassword);
    }

    if (formData.newPassword.trim()) {
      setMessage({ 
        type: 'success', 
        text: 'Perfil actualizado. Contraseña cambió exitosamente.' 
      });
    } else {
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' });
    }

    setEditMode(false);
    setFormData(prev => ({ ...prev, newPassword: '' }));
  };

  if (!studentData) {
    return (
      <Box>
        <Alert severity="warning">
          Por favor completa tu registro primero antes de acceder al perfil.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '2rem' },
        }}
      >
        Mi Perfil
      </Typography>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Edit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            {!editMode && (
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.background.paper,
                  fontWeight: 600,
                }}
              >
                Editar
              </Button>
            )}
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSaveChanges}>
            {/* SIGN UP SECTION */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 2.5,
              }}
            >
              Información de Cuenta
            </Typography>

            {/* Username - Read Only */}
            <TextField
              fullWidth
              label="Usuario"
              value={formData.username}
              disabled
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Current Password - Read Only in View Mode */}
            <TextField
              fullWidth
              label="Contraseña Actual"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              disabled
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    disabled
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: editMode ? 1 : 2.5 }}
            />

            {/* New Password - Only in Edit Mode */}
            {editMode && (
              <>
                <TextField
                  fullWidth
                  label="Nueva Contraseña (opcional)"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Dejar en blanco para no cambiar"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                  sx={{ mb: 2.5 }}
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* STUDENT REGISTER SECTION */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 2.5,
              }}
            >
              Información Personal
            </Typography>

            {/* Nombre */}
            <TextField
              fullWidth
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Matrícula */}
            <TextField
              fullWidth
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Carrera */}
            <TextField
              fullWidth
              label="Carrera"
              name="carrera"
              value={formData.carrera}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Correo */}
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Celular */}
            <TextField
              fullWidth
              label="Celular"
              name="celular"
              value={formData.celular}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

            {/* Hora de Registro */}
            <TextField
              fullWidth
              label="Hora de Registro"
              name="hora_registro"
              value={formData.hora_registro}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            {editMode && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.background.paper,
                    fontWeight: 600,
                  }}
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditMode(false);
                    setFormData(prev => ({
                      ...prev,
                      username: studentData.username,
                      password: studentData.password,
                      nombre: studentData.nombre,
                      matricula: studentData.matricula,
                      carrera: studentData.carrera,
                      correo: studentData.correo,
                      celular: studentData.celular,
                      hora_registro: studentData.hora_registro,
                      newPassword: '',
                    }));
                    setMessage({ type: '', text: '' });
                  }}
                  sx={{
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>

          {/* ENROLLED PROJECT SECTION */}
          {enrolledProject && (
            <>
              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2.5,
                }}
              >
                Proyecto Inscrito
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Nombre del Proyecto
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.primary.main }}>
                    {enrolledProject.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Duración
                  </Typography>
                  <Typography sx={{ fontSize: '1rem' }}>
                    {enrolledProject.duration}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Horas Acreditadas
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {enrolledProject.horas_acreditadas}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Lugar
                  </Typography>
                  <Typography sx={{ fontSize: '1rem' }}>
                    {enrolledProject.lugar}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Organización
                  </Typography>
                  <Typography sx={{ fontSize: '1rem' }}>
                    {enrolledOrg?.name_org || 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Descripción
                  </Typography>
                  <Typography sx={{ fontSize: '1rem' }}>
                    {enrolledProject.description}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {!enrolledProject && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No estás inscrito en ningún proyecto aún.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProfile;