import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SocioProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          // Fall back to stored user data
          const stored = localStorage.getItem('user');
          if (stored) setUser(JSON.parse(stored));
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        else setError('No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: '#2479bd', mb: 2 }}>
            <AccountCircleIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            {user?.full_name || 'Socioformador'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role || 'SOCIO'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Correo electrónico</Typography>
            <Typography variant="body1">{user?.email || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Rol</Typography>
            <Typography variant="body1">{user?.role || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Miembro desde</Typography>
            <Typography variant="body1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-MX') : '—'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SocioProfile;
