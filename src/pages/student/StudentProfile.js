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
  Chip,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, School, Business, Place, Timer, Stars } from '@mui/icons-material';
import * as storageService from '../../services/StorageService';

const PERIOD_COLORS = {
  'Invierno': { bg: '#dbeafe', color: '#1d4ed8', icon: '❄️' },
  'Verano':   { bg: '#fef9c3', color: '#a16207', icon: '☀️' },
  'Ago-Dic':  { bg: '#dcfce7', color: '#15803d', icon: '🍂' },
  'Ene-Jul':  { bg: '#fce7f3', color: '#9d174d', icon: '🌸' },
};

const getPeriodStyle = (periodo) => {
  return PERIOD_COLORS[periodo] || { bg: '#f3f4f6', color: '#374151', icon: '📅' };
};

const StudentProfile = () => {
  const theme = useTheme();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const id_usuario = user?.id_usuario;

  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
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

  const loadStudentData = useCallback(async () => {
    try {
      const apiBase = `/api`;
      const res = await fetch(`${apiBase}/students/${id_usuario}`);
      const result = await res.json();
      if (result.success) {
        const s = result.data;
        const merged = {
          ...s,
          id_usuario: s.user_id || s.id_usuario,
          nombre: s.nombre || s.full_name || '',
          apellidos: s.apellidos || '',
          matricula: s.matricula || '',
          carrera: s.carrera || '',
          correo: s.correo || s.user?.email || '',
          celular: s.celular || s.phone || '',
          hora_registro: s.hora_registro || '',
          enrollments: s.enrollments || [],
        };
        setStudentData(merged);
        setFormData({
          username: user?.username || '',
          password: user?.contrasena || '',
          nombre: merged.nombre,
          apellidos: merged.apellidos,
          matricula: merged.matricula,
          carrera: merged.carrera,
          correo: merged.correo,
          celular: merged.celular,
          hora_registro: merged.hora_registro,
          newPassword: '',
          confirmNewPassword: '',
        });
        return;
      }
    } catch (err) { console.warn('API fetch failed, falling back to localStorage'); }
    // Fallback
    const estudiantes = storageService.getEstudiantes();
    const arr = Array.isArray(estudiantes) ? estudiantes : Object.values(estudiantes || {});
    const s = arr.find(est => est.id_usuario === id_usuario);
    if (s) {
      setStudentData(s);
      setFormData({
        username: user?.username || '',
        password: user?.contrasena || '',
        nombre: s?.nombre || '',
        apellidos: s?.apellidos || '',
        matricula: s?.matricula || '',
        carrera: s?.carrera || '',
        correo: s?.correo || '',
        celular: s?.celular || '',
        hora_registro: s?.hora_registro || '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [id_usuario, user?.username, user?.contrasena]);

  useEffect(() => { loadStudentData(); }, [loadStudentData]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'estudiantes') loadStudentData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadStudentData]);

  useEffect(() => {
    const handleStudentUpdate = () => loadStudentData();
    window.addEventListener('studentDataUpdated', handleStudentUpdate);
    return () => window.removeEventListener('studentDataUpdated', handleStudentUpdate);
  }, [loadStudentData]);

  // Build enrolled projects from API data (enrollment already has all fields mapped by backend)
  const enrolledProjects = Array.isArray(studentData?.enrollments)
    ? studentData.enrollments
        .map(enrollment => {
          const nombre_proyecto = enrollment.nombre_proyecto;
          if (!nombre_proyecto) return null;
          return {
            id_proyecto: enrollment.id_proyecto || enrollment.project_id,
            nombre_proyecto,
            nombre_osf: enrollment.nombre_osf || 'No especificado',
            periodo: enrollment.periodo || null,
            duracion: enrollment.duracion || 'No especificado',
            lugar: enrollment.lugar || 'No especificado',
            horas_acreditadas: enrollment.horas_acreditadas ?? 'N/A',
            enrollment_id: enrollment.id || enrollment.enrollment_id,
          };
        })
        .filter(Boolean)
    : [];

  const isEnrolled = enrolledProjects.length > 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const matriculaRegex = /^A0\d{7}$/;
    if (!matriculaRegex.test(formData.matricula)) { setMessage({ type: 'error', text: 'La matrícula debe comenzar con A0 y tener 9 caracteres' }); return; }
    if (!formData.nombre.trim()) { setMessage({ type: 'error', text: 'El nombre es requerido' }); return; }
    if (!formData.matricula.trim()) { setMessage({ type: 'error', text: 'La matrícula es requerida' }); return; }
    if (!formData.carrera.trim()) { setMessage({ type: 'error', text: 'La carrera es requerida' }); return; }
    if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo) || /@tec\.mx$/i.test(formData.correo)) {
      setMessage({ type: 'error', text: 'Email inválido o no puede ser @tec.mx' }); return;
    }
    if (!formData.celular.trim()) { setMessage({ type: 'error', text: 'El celular es requerido' }); return; }
    if (formData.newPassword.trim()) {
      const pw = formData.newPassword;
      if (pw.length < 12) { setMessage({ type: 'error', text: 'La contraseña debe tener al menos 12 caracteres' }); return; }
      if (!/[A-Z]/.test(pw)) { setMessage({ type: 'error', text: 'La contraseña debe contener mayúsculas' }); return; }
      if (!/[0-9]/.test(pw)) { setMessage({ type: 'error', text: 'La contraseña debe contener números' }); return; }
      if (pw !== formData.confirmNewPassword) { setMessage({ type: 'error', text: 'Las contraseñas no coinciden' }); return; }
    }

    const finalPassword = formData.newPassword.trim() ? formData.newPassword : formData.password;
    const apiBase = `/api`;

    try {
      const putStudentRes = await fetch(`${apiBase}/students/${id_usuario}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${formData.nombre} ${formData.apellidos}`.trim(),
          nombre: formData.nombre, apellidos: formData.apellidos,
          matricula: formData.matricula, phone: formData.celular,
          celular: formData.celular, carrera: formData.carrera,
          correo: formData.correo, hora_registro: formData.hora_registro,
        })
      });
      const putStudentResult = await putStudentRes.json();
      if (!putStudentResult.success) { setMessage({ type: 'error', text: `Error: ${putStudentResult.message}` }); return; }

      if (formData.newPassword.trim()) {
        await fetch(`${apiBase}/users/${id_usuario}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: finalPassword })
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión al guardar cambios' }); return;
    }

    const updatedStudent = {
      ...studentData,
      nombre: formData.nombre, apellidos: formData.apellidos || '',
      matricula: formData.matricula, carrera: formData.carrera,
      correo: formData.correo, celular: formData.celular,
      hora_registro: formData.hora_registro,
    };
    storageService.saveEstudiante(updatedStudent);
    sessionStorage.setItem('studentData', JSON.stringify(updatedStudent));
    sessionStorage.setItem('user', JSON.stringify({ ...user, contrasena: finalPassword }));
    setStudentData(updatedStudent);
    setFormData(prev => ({ ...prev, password: finalPassword, newPassword: '', confirmNewPassword: '' }));
    setMessage({ type: 'success', text: formData.newPassword ? 'Perfil actualizado. Contraseña cambiada.' : 'Perfil actualizado exitosamente.' });
    window.dispatchEvent(new Event('studentDataUpdated'));
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
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

            <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
            <TextField fullWidth label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleInputChange} disabled={!editMode} margin="normal" sx={{ mb: 2 }} />
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
          {/* Sección de Proyectos Inscritos              */}
          {/* ============================================ */}
          <Divider sx={{ my: 3 }} />

          {isEnrolled ? (
            <>
              {/* ============================================ */}
              {/* BADGE "INSCRITO" visual al inicio            */}
              {/* ============================================ */}
              <Box
                sx={{
                  mb: 4,
                  mt: 1,
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(5, 150, 105, 0.35)',
                  position: 'relative',
                }}
              >
                {/* Decorative circles */}
                <Box sx={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }} />
                <Box sx={{
                  position: 'absolute', bottom: -30, left: -10,
                  width: 120, height: 120, borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }} />

                <Box sx={{
                  p: { xs: 3, sm: 4 },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                }}>
                  {/* Check icon */}
                  <Box sx={{
                    width: 80, height: 80, borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: '3px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 0 0 6px rgba(255,255,255,0.08)',
                  }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#ffffff' }} />
                  </Box>

                  {/* Text */}
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 0.5 }}>
                      <School sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }} />
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Estado de Inscripción
                      </Typography>
                    </Box>
                    <Typography sx={{
                      color: '#ffffff', fontSize: { xs: '1.8rem', sm: '2.2rem' },
                      fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px',
                    }}>
                      ✓ INSCRITO
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', mt: 0.5 }}>
                      {enrolledProjects.length === 1
                        ? `Registrado en 1 proyecto de servicio social`
                        : `Registrado en ${enrolledProjects.length} proyectos de servicio social`}
                    </Typography>
                  </Box>

                  {/* Badge pills — uno por cada periodo inscrito */}
                  <Box sx={{ ml: { sm: 'auto' }, flexShrink: 0, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                    {enrolledProjects.length > 0
                      ? [...new Set(enrolledProjects.map(p => p.periodo).filter(Boolean))].map((periodo) => (
                          <Box key={periodo} sx={{
                            px: 2.5, py: 1,
                            borderRadius: '100px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '2px solid rgba(255,255,255,0.4)',
                            backdropFilter: 'blur(4px)',
                          }}>
                            <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                              {getPeriodStyle(periodo).icon} {periodo}
                            </Typography>
                          </Box>
                        ))
                      : (
                        <Box sx={{
                          px: 2.5, py: 1,
                          borderRadius: '100px',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          border: '2px solid rgba(255,255,255,0.4)',
                        }}>
                          <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>
                            📋 Activo
                          </Typography>
                        </Box>
                      )
                    }
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5 }}>
                Proyectos Inscritos ({enrolledProjects.length})
              </Typography>

              {enrolledProjects.map((project, index) => {
                const periodoStyle = getPeriodStyle(project.periodo);
                return (
                  <Box
                    key={`${project.id_proyecto}-${index}`}
                    sx={{
                      mb: 3,
                      pb: 3,
                      borderBottom: index < enrolledProjects.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    }}
                  >
                    {/* Project header with period chip */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: theme.palette.primary.main, flex: 1 }}>
                        {project.nombre_proyecto}
                      </Typography>
                      {project.periodo && (
                        <Chip
                          label={`${periodoStyle.icon} ${project.periodo}`}
                          size="small"
                          sx={{
                            backgroundColor: periodoStyle.bg,
                            color: periodoStyle.color,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Business sx={{ fontSize: 18, color: theme.palette.text.secondary, mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block' }}>Organización</Typography>
                          <Typography sx={{ fontSize: '0.95rem' }}>{project.nombre_osf}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Stars sx={{ fontSize: 18, color: theme.palette.text.secondary, mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block' }}>Horas Acreditadas</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {project.horas_acreditadas !== 'N/A' ? `${project.horas_acreditadas} hrs` : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Timer sx={{ fontSize: 18, color: theme.palette.text.secondary, mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block' }}>Duración</Typography>
                          <Typography sx={{ fontSize: '0.95rem' }}>{project.duracion}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Place sx={{ fontSize: 18, color: theme.palette.text.secondary, mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block' }}>Lugar</Typography>
                          <Typography sx={{ fontSize: '0.95rem' }}>{project.lugar}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}


            </>
          ) : (
            <Alert severity="info">
              No estás inscrito en ningún proyecto aún.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProfile;