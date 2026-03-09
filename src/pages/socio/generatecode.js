import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SocioGenerateCode = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const token = localStorage.getItem('access_token');

  // Fetch the socio's projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data || []);
      } catch (err) {
        setError('No se pudieron cargar los proyectos.');
      } finally {
        setFetching(false);
      }
    };
    fetchProjects();
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setGeneratedCode(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleGenerate = async () => {
    if (!selectedProject) return setError('Selecciona un proyecto');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/projects/${selectedProject}/codes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedCode(res.data.code);
      setSecondsLeft(res.data.expires_in_seconds || 120);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al generar el código';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ color: '#2479bd', mb: 3 }}>
        Generar Código de Inscripción
      </Typography>

      {fetching ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            select
            fullWidth
            label="Proyecto"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            sx={{ mb: 3 }}
          >
            {projects.length === 0 ? (
              <MenuItem disabled>Sin proyectos disponibles</MenuItem>
            ) : (
              projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGenerate}
            disabled={loading || !selectedProject}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
            sx={{
              backgroundColor: '#2479bd',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              mb: 3,
              '&:hover': { backgroundColor: '#1b5f94' },
            }}
          >
            {loading ? 'Generando…' : 'Generar Código'}
          </Button>

          {generatedCode && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                Código activo — muéstralo a los estudiantes:
              </Typography>
              <Chip
                label={generatedCode}
                color="primary"
                sx={{ fontSize: '2rem', height: 64, px: 3, letterSpacing: 8, fontWeight: 'bold' }}
              />
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <TimerIcon fontSize="small" color="warning" />
                  <Typography variant="body2" color="warning.main">
                    Expira en {secondsLeft}s
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(secondsLeft / 120) * 100}
                  color="warning"
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SocioGenerateCode;
