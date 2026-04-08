import React, { useState, useEffect, useCallback } from 'react';
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
import * as storageService from '../../services/StorageService';

const StudentProfile = () => {
  const theme = useTheme();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const id_usuario = user?.id_usuario;

  //  State for dynamic data updates
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    matricula: '',
    carrera: '',
    correo: '',
    celular: '',
    hora_registro: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  //  Wrap loadStudentData in useCallback to avoid dependency issues
  const loadStudentData = useCallback(() => {
    const estudiantes = storageService.getEstudiantes();
    const estudiantesArray = Array.isArray(estudiantes) ? estudiantes : Object.values(estudiantes || {});
    const currentStudentData = estudiantesArray.find(est => est.id_usuario === id_usuario);

    if (currentStudentData) {
      setStudentData(currentStudentData);
      setFormData({
        username: user?.username || '',
        password: user?.contraseña || '',
        nombre: currentStudentData?.nombre || '',
        matricula: currentStudentData?.matricula || '',
        carrera: currentStudentData?.carrera || '',
        correo: currentStudentData?.correo || '',
        celular: currentStudentData?.celular || '',
        hora_registro: currentStudentData?.hora_registro || '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [id_usuario, user?.username, user?.contraseña]);

  //  Load data on mount
  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  //  Listen for admin updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'estudiantes') {
        console.log('Datos de estudiantes actualizados desde otro tab');
        loadStudentData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadStudentData]);

  //  Listen for custom events from admin updates (same tab)
  useEffect(() => {
    const handleStudentUpdate = () => {
      console.log('Evento de actualización recibido');
      loadStudentData();
    };

    window.addEventListener('studentDataUpdated', handleStudentUpdate);
    return () => window.removeEventListener('studentDataUpdated', handleStudentUpdate);
  }, [loadStudentData]);

  // ============================================
  // NEW: Get all enrolled projects from enrollments array
  // ============================================
  const enrolledProjects = Array.isArray(studentData?.enrollments)
    ? studentData.enrollments
        .map(enrollment => {
          const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
          const org = organizations.find(o => o.id_organizacion === enrollment.id_organizacion);
          return { ...project, org, periodo: enrollment.periodo };
        })
        .filter(p => p) // Remove any undefined projects
    : [];

  // Keep old logic for backward compatibility (if single id_proyecto exists)
  const enrolledProject = projects.find(p => p.id_proyecto === studentData?.id_proyecto);
  const enrolledOrg = organizations.find(o => o.id_organizacion === enrolledProject?.id_organizacion);

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

    const finalPassword = formData.newPassword.trim() ? formData.newPassword : formData.password;

    // Get students from storage
    const estudiantesRaw = storageService.getEstudiantes() || [];
    const estudiantes = Array.isArray(estudiantesRaw) ? estudiantesRaw : Object.values(estudiantesRaw);

    // Find student index
    const studentIndex = estudiantes.findIndex(est => est.id_usuario === id_usuario);

    if (studentIndex !== -1) {
      // Update with all original fields
      estudiantes[studentIndex] = {
        ...estudiantes[studentIndex],
        nombre: formData.nombre,
        apellidos: formData.apellidos || '',
        matricula: formData.matricula,
        carrera: formData.carrera,
        correo: formData.correo,
        celular: formData.celular,
        hora_registro: formData.hora_registro,
        username: formData.username,
      };

      // Save to localStorage
      localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
      console.log("Estudiante actualizado:", estudiantes[studentIndex]);

      // Update sessionStorage
      sessionStorage.setItem('studentData', JSON.stringify(estudiantes[studentIndex]));
      sessionStorage.setItem('user', JSON.stringify({ ...user, contraseña: finalPassword }));

      // Update local state
      setStudentData(estudiantes[studentIndex]);
      setFormData(prev => ({
        ...prev,
        password: finalPassword,
        newPassword: '',
        confirmNewPassword: '',
      }));
    }

    // Update user credentials
    storageService.saveUsuario(id_usuario, { ...user, contraseña: finalPassword });

    setMessage({
      type: 'success',
      text: formData.newPassword
        ? 'Perfil actualizado. Contraseña cambiada exitosamente.'
        : 'Perfil actualizado exitosamente.',
    });

    // Dispatch event for other components
    window.dispatchEvent(new Event('studentDataUpdated'));
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reload data to discard changes
    loadStudentData();
    setMessage({ type: '', text: '' });
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
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setConfirmNewPassword(!confirmNewPassword)} edge="end" size="small">
                        {confirmNewPassword ? <VisibilityOff /> : <Visibility />}
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
                  onClick={handleCancel}
                  sx={{ borderColor: theme.palette.divider, color: theme.palette.text.primary }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>

          {/* ============================================ */}
          {/* NEW: Display all enrolled projects */}
          {/* ============================================ */}
          {enrolledProjects.length > 0 ? (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
                Proyectos Inscritos ({enrolledProjects.length})
              </Typography>

              {enrolledProjects.map((project, index) => (
                <Box key={`${project.id_proyecto}-${index}`} sx={{ mb: 3, pb: 3, borderBottom: index < enrolledProjects.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Nombre del Proyecto</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.primary.main }}>{project.nombre_proyecto}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Duración</Typography>
                      <Typography sx={{ fontSize: '1rem' }}>{project.duracion}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Horas Acreditadas</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{project.horas_acreditadas}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Lugar</Typography>
                      <Typography sx={{ fontSize: '1rem' }}>{project.lugar}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Periodo</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.info.main }}>{project.periodo}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Organización</Typography>
                      <Typography sx={{ fontSize: '1rem' }}>{project.org?.nombre_osf || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Descripción</Typography>
                      <Typography sx={{ fontSize: '1rem' }}>{project.descripcion_proyecto}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <>
              <Divider sx={{ my: 3 }} />
              <Alert severity="info">
                No estás inscrito en ningún proyecto aún.
              </Alert>
            </>
          )}

          {/* Backward compatibility: Show old single project if no enrollments array */}
          {enrolledProjects.length === 0 && enrolledProject && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
                Proyecto Inscrito
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Nombre del Proyecto</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.primary.main }}>{enrolledProject.nombre_proyecto}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Duración</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.duracion}</Typography>
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
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Periodo</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.periodo}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Organización</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledOrg?.nombre_osf || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.75 }}>Descripción</Typography>
                  <Typography sx={{ fontSize: '1rem' }}>{enrolledProject.descripcion_proyecto}</Typography>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProfile;