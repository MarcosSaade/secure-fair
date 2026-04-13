import React, { useState, useEffect } from 'react';
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


const BecarioProfile = () => {
  
  const theme = useTheme();

  const user = JSON.parse(sessionStorage.getItem('user'));
  const id_usuario = user?.id_usuario;

  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🔹 Cargar datos desde usuarios
  useEffect(() => {
    if (!id_usuario) return;

    const usuarios = storageService.getUsuarios();
    const currentUser = usuarios.find(u => u.id_usuario === id_usuario);

    if (currentUser) {
      setUserData(currentUser);
      setFormData({
        username: currentUser.username || '',
        password: currentUser.contraseña || '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [id_usuario]);

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

    // 🔹 Validaciones de contraseña (igual que admin)
    if (formData.newPassword.trim()) {
      const pw = formData.newPassword;

      if (pw.length < 12)
        return setMessage({ type: 'error', text: 'La contraseña debe tener al menos 12 caracteres' });

      if (!/[A-Z]/.test(pw))
        return setMessage({ type: 'error', text: 'La contraseña debe contener mayúsculas' });

      if (!/[0-9]/.test(pw))
        return setMessage({ type: 'error', text: 'La contraseña debe contener números' });

      if (!/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(pw))
        return setMessage({ type: 'error', text: 'La contraseña debe contener caracteres especiales' });

      if (pw !== formData.confirmNewPassword)
        return setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
    }

    const finalPassword =
      formData.newPassword.trim() || formData.password;

    const updatedUser = {
      ...userData,
      username: formData.username,
      contraseña: finalPassword,
    };

    //  Guardar SOLO en usuarios
    storageService.saveUsuario(id_usuario, updatedUser);

    //  Actualizar sessionStorage
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    setUserData(updatedUser);
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

  const handleCancel = () => {
    setEditMode(false);
    setMessage({ type: '', text: '' });
  };

  if (!userData) {
    return <Alert severity="warning">No se encontró el usuario.</Alert>;
  }

return (
  <Box>
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

    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          {!editMode && (
            <Button
              variant="contained"
              onClick={() => setEditMode(true)}
              sx={{
                backgroundColor: theme.palette.paper,
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
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
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
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      size="small"
                    >
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
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
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
                  onClick={handleCancel}
                  sx={{
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  </Box>
);
};

export default BecarioProfile;