import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import * as storageService from '../../services/StorageService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';



const SocioProfile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const id_usuario = user?.id_usuario;
  const id_organizacion = user?.id_organizacion;
  

  // State for socio data
  const [socioData, setSocioData] = useState(null);
  const [organizationData, setOrganizationData] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  //  Load socio data from storage
  const loadSocioData = useCallback(() => {
    try {
      const sociosRaw = localStorage.getItem('socios');
      console.log('Raw socios from localStorage:', sociosRaw);
      
      let socios = [];
      if (sociosRaw) {
        const parsed = JSON.parse(sociosRaw);
        socios = Array.isArray(parsed) ? parsed : Object.values(parsed);
      }
      
      console.log('Socios array:', socios);
      console.log('Current id_usuario:', id_usuario);

      const currentSocioData = socios.find(socio => socio.id_usuario === id_usuario);
      console.log('Found socio:', currentSocioData);

      if (currentSocioData) {
        setSocioData(currentSocioData);
        setFormData({
          username: currentSocioData?.username || '',
          password: user?.contraseña || '',
          newPassword: '',
          confirmNewPassword: '',
        });

        // Load organization data
        const organizaciones = storageService.getOrganizaciones();
        const org = organizaciones.find(o => o.id_organizacion === id_organizacion);
        setOrganizationData(org);


        // Load projects for this organization
        const proyectos = storageService.getProyectos();
        const orgProjects = proyectos.filter(p => p.id_organizacion === id_organizacion);
        setProjectsData(orgProjects);
      }
    } catch (error) {
      console.error('Error loading socio data:', error);
    }
  }, [id_usuario, id_organizacion, user?.contraseña]);

  // Load data on mount
  useEffect(() => {
    if (id_usuario) {
      loadSocioData();
    }
  }, [id_usuario, loadSocioData]);

  // Listen for updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'socios') {
        console.log('Datos de socio actualizados desde otro tab');
        loadSocioData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSocioData]);

  // Listen for custom events from socio updates (same tab)
  useEffect(() => {
    const handleSocioUpdate = () => {
      console.log('Evento de actualización de socio recibido');
      loadSocioData();
    };

    window.addEventListener('socioDataUpdated', handleSocioUpdate);
    return () => window.removeEventListener('socioDataUpdated', handleSocioUpdate);
  }, [loadSocioData]);

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

    //  Validate username is not already taken
    if (formData.username !== socioData.username) {
      // Get all users to check for duplicate usernames
      const sociosRaw = localStorage.getItem('socios');
      let socios = [];
      if (sociosRaw) {
        const parsed = JSON.parse(sociosRaw);
        socios = Array.isArray(parsed) ? parsed : Object.values(parsed);
      }

      const usernameExists = socios.some(
        s => s.username === formData.username && s.id_usuario !== id_usuario
      );

      if (usernameExists) {
        setMessage({ type: 'error', text: 'Este nombre de usuario ya está en uso' });
        return;
      }

      // Also check in admins
      const admins = storageService.getAdmins();
      const adminUsernameExists = admins.some(a => a.username === formData.username);
      if (adminUsernameExists) {
        setMessage({ type: 'error', text: 'Este nombre de usuario ya está en uso' });
        return;
      }

      // Check in usuarios
      const usuarios = storageService.getUsuarios();
      const usuarioUsernameExists = usuarios.some(
        u => u.username === formData.username && u.id_usuario !== id_usuario
      );
      if (usuarioUsernameExists) {
        setMessage({ type: 'error', text: 'Este nombre de usuario ya está en uso' });
        return;
      }
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

    const finalPassword = formData.newPassword.trim() ? formData.newPassword : formData.password;

    // Get socios from storage
    const sociosRaw = localStorage.getItem('socios');
    let socios = [];
    if (sociosRaw) {
      const parsed = JSON.parse(sociosRaw);
      socios = Array.isArray(parsed) ? parsed : Object.values(parsed);
    }

    // Find socio index
    const socioIndex = socios.findIndex(socio => socio.id_usuario === id_usuario);

    if (socioIndex !== -1) {
      // Update socio with new username and password
      const updatedSocio = {
        ...socios[socioIndex],
        username: formData.username,
        contraseña: finalPassword,
      };

      socios[socioIndex] = updatedSocio;

      // Save to localStorage
      localStorage.setItem('socios', JSON.stringify(socios));
      console.log('Socio actualizado:', updatedSocio);

      // Update sessionStorage
      sessionStorage.setItem('user', JSON.stringify({ 
        ...user, 
        username: formData.username,
        contraseña: finalPassword 
      }));

      // Update local state
      setSocioData(updatedSocio);
      setFormData(prev => ({
        ...prev,
        password: finalPassword,
        newPassword: '',
        confirmNewPassword: '',
      }));

      // Also update in usuarios collection for login purposes
      storageService.saveUsuario(id_usuario, { 
        ...user, 
        username: formData.username,
        contraseña: finalPassword 
      });
    }

    setMessage({
      type: 'success',
      text: formData.newPassword
        ? 'Perfil actualizado. Contraseña cambiada exitosamente.'
        : 'Perfil actualizado exitosamente.',
    });

    // Dispatch event for other components
    window.dispatchEvent(new Event('socioDataUpdated'));
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reload data to discard changes
    loadSocioData();
    setMessage({ type: '', text: '' });
  };

  if (!socioData) {
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate((`/socio/main_pageSocio/${id_organizacion}`))}
          sx={{ mb: 3, color: theme.palette.text.primary }}
        >
          Volver
        </Button>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Perfil de {organizationData?.nombre_osf || 'N/A'}
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

            <TextField
              fullWidth
              label="Usuario"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              sx={{ mb: 2 }}
            />

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
              Información de Organización
            </Typography>

            <TextField
              fullWidth
              label="Nombre de Organización"
              value={organizationData?.nombre_osf || 'N/A'}
              disabled
              margin="normal"
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2.5, mt: 3 }}>
              Proyectos ({projectsData.length})
            </Typography>

            {projectsData.length > 0 ? (
              projectsData.map((project, index) => (
                <Box key={`${project.id_proyecto}-${index}`} sx={{ mb: 2.5, pb: 2.5, borderBottom: index < projectsData.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Nombre del Proyecto
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.primary.main }}>
                        {project.nombre_proyecto}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Duración
                      </Typography>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {project.duracion}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Horas Acreditadas
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {project.horas_acreditadas}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Lugar
                      </Typography>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {project.lugar}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Descripción
                      </Typography>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {project.descripcion_proyecto}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Alert severity="info">
                No hay proyectos asociados a esta organización.
              </Alert>
            )}

            {editMode && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.background.paper, fontWeight: 600 }}
                >
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default SocioProfile;