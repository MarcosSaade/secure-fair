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
    const student = studentAccounts[username];

    if (!student) return null;

    if (student.apellidos && !student.nombre.includes(student.apellidos)) {
      student.nombre = `${student.nombre} ${student.apellidos}`;
    }

    return student;
  };

  const studentData = getStudentData();

  const [formData, setFormData] = useState({
    username: studentData?.username || username || '',
    password: studentData?.password || '',
    nombre: studentData?.nombre || '',
    matricula: studentData?.matricula || '',
    carrera: studentData?.carrera || '',
    correo: studentData?.correo || '',
    celular: studentData?.celular || '',
    hora_registro: studentData?.hora_registro || '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

    const matriculaRegex = /^A0\d{7}$/;

    if (!matriculaRegex.test(formData.matricula)) {
      setMessage({
        type: 'error',
        text: 'La matrícula debe comenzar con A0 y tener 9 caracteres (Ej: A01234567)',
      });
      return;
    }

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

    // Email must be valid and NOT @tec.mx
    if (
      !formData.correo.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo) ||
      /@tec\.mx$/i.test(formData.correo)
    ) {
      setMessage({ type: 'error', text: 'Email inválido o no puede ser @tec.mx' });
      return;
    }

    if (!formData.celular.trim()) {
      setMessage({ type: 'error', text: 'El celular es requerido' });
      return;
    }

    // Validate new password if provided
    if (formData.newPassword.trim()) {
      const pw = formData.newPassword;
      if (pw.length < 12) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 12 caracteres' });
        return;
      }
      if (!/[A-Z]/.test(pw)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener mayúsculas' });
        return;
      }
      if (!/[0-9]/.test(pw)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener números' });
        return;
      }
      if (!/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(pw)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener caracteres especiales' });
        return;
      }
      if (pw !== formData.confirmNewPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
        return;
      }
    }

    // Determine final password
    const finalPassword = formData.newPassword.trim() ? formData.newPassword : formData.password;

    // Update localStorage
    const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    studentAccounts[username] = {
      ...studentAccounts[username],
      username: formData.username,
      password: finalPassword,
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
    sessionStorage.setItem('password', finalPassword);

    // Update formData state
    setFormData(prev => ({
      ...prev,
      password: finalPassword,
      newPassword: '',
      confirmNewPassword: '',
    }));

    setMessage({
      type: 'success',
      text: formData.newPassword
        ? 'Perfil actualizado. Contraseña cambiada exitosamente.'
        : 'Perfil actualizado exitosamente.',
    });

    setEditMode(false);
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
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Mi Perfil
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            {!editMode && (
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
                sx={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.background.paper, fontWeight: 600 }}
              >
                Editar
              </Button>
            )}
          </Box>

          {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

          <Box component="form" onSubmit={handleSaveChanges}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
              Información de Cuenta
            </Typography>

            <TextField fullWidth label="Usuario" value={formData.username} disabled margin="normal" sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Contraseña Actual"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              disabled
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: editMode ? 1 : 2.5 }}
            />

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
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                        {showNewPassword ? <VisibilityOff /> : <Visibility/>}
                      </IconButton>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  name="confirmNewPassword"
                  type={confirmNewPassword ? 'text' : 'password'}
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  margin="normal"
                  InputProps = {{
                    endAdornment: (
                      <IconButton onClick = {() => setConfirmNewPassword(!confirmNewPassword)} edge="end" size="small">
                        {confirmNewPassword ? <VisibilityOff /> : <Visibility/>}
                      </IconButton>
                    ),
                  }}
                  sx={{ mb: 2.5 }}
                  
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
              Información Personal
            </Typography>

            <TextField fullWidth label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Matrícula" name="matricula" value={formData.matricula} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Carrera" name="carrera" value={formData.carrera} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Correo Electrónico" name="correo" type="email" value={formData.correo} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Celular" name="celular" value={formData.celular} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Hora de Registro" name="hora_registro" value={formData.hora_registro} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 3 }} />

            {editMode && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.background.paper, fontWeight: 600 }}>
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      ...formData,
                      password: studentData.password,
                      nombre: studentData.nombre,
                      matricula: studentData.matricula,
                      carrera: studentData.carrera,
                      correo: studentData.correo,
                      celular: studentData.celular,
                      hora_registro: studentData.hora_registro,
                      newPassword: '',
                      confirmNewPassword: '',
                    });
                    setMessage({ type: '', text: '' });
                  }}
                  sx={{ borderColor: theme.palette.divider, color: theme.palette.text.primary }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>

          {enrolledProject && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
                Proyecto Inscrito
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Nombre del Proyecto</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.primary.main }}>{enrolledProject.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Duración</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.duration}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Horas Acreditadas</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{enrolledProject.horas_acreditadas}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Lugar</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.lugar}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Organización</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledOrg?.name_org || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Descripción</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.description}</Typography>
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