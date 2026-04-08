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
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as storageService from '../../services/StorageService';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminProfile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const id_usuario = user?.id_usuario;

  // State for admin data
  const [adminData, setAdminData] = useState(null);
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

  // Load admin data from storage
  const loadAdminData = useCallback(() => {
    try {
      const admins = storageService.getAdmins();
      console.log('Admins from storage:', admins);
      console.log('Current id_usuario:', id_usuario);

      const currentAdminData = admins.find(admin => admin.id_usuario === id_usuario);
      console.log('Found admin:', currentAdminData);

      if (currentAdminData) {
        setAdminData(currentAdminData);
        setFormData({
          username: currentAdminData?.username || '',
          password: user?.contraseña || '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [id_usuario, user?.contraseña]);

  // Load data on mount
  useEffect(() => {
    if (id_usuario) {
      loadAdminData();
    }
  }, [id_usuario, loadAdminData]);

  // Listen for updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admins') {
        console.log('Datos de administrador actualizados desde otro tab');
        loadAdminData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadAdminData]);

  // Listen for custom events from admin updates (same tab)
  useEffect(() => {
    const handleAdminUpdate = () => {
      console.log('Evento de actualización de admin recibido');
      loadAdminData();
    };

    window.addEventListener('adminDataUpdated', handleAdminUpdate);
    return () => window.removeEventListener('adminDataUpdated', handleAdminUpdate);
  }, [loadAdminData]);

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

    // Get admins from storage
    const adminsRaw = storageService.getAdmins() || [];
    const admins = Array.isArray(adminsRaw) ? adminsRaw : Object.values(adminsRaw);

    // Find admin index
    const adminIndex = admins.findIndex(admin => admin.id_usuario === id_usuario);

    if (adminIndex !== -1) {
      // Update admin with new username and password
      const updatedAdmin = {
        ...admins[adminIndex],
        username: formData.username,
        contraseña: finalPassword,
      };

      admins[adminIndex] = updatedAdmin;

      // Save to localStorage
      localStorage.setItem('admins', JSON.stringify(admins));
      console.log('Administrador actualizado:', updatedAdmin);

      // Update sessionStorage
      sessionStorage.setItem('adminData', JSON.stringify(updatedAdmin));
      sessionStorage.setItem('user', JSON.stringify({ 
        ...user, 
        username: formData.username,
        contraseña: finalPassword 
      }));

      // Update local state
      setAdminData(updatedAdmin);
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
    window.dispatchEvent(new Event('adminDataUpdated'));
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reload data to discard changes
    loadAdminData();
    setMessage({ type: '', text: '' });
  };

  if (!adminData) {
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
          onClick={() => navigate('/admin')}
          sx={{ mb: 3 }}
        >
          Volver
        </Button>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Mi Perfil de Administrador
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

export default AdminProfile;