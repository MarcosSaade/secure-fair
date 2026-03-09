/**
 * SocioDashboard
 *
 * Socioformador (partner) panel showing assigned projects
 * and allowing enrollment code generation.
 */

import { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  location: string;
  max_students_per_slot: number;
  is_active: boolean;
}

interface EnrollmentCode {
  code: string;
  project_id: number;
  expires_at: string;
}

export default function SocioDashboard() {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Code generation state
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [activeCode, setActiveCode] = useState<EnrollmentCode | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiClient.get<Project[]>('/projects/my-projects');
        setProjects(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar proyectos');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Countdown timer for active code
  useEffect(() => {
    if (!activeCode) return;
    const expiresAt = new Date(activeCode.expires_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) setActiveCode(null);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeCode]);

  const generateCode = async (projectId: number) => {
    setGeneratingFor(projectId);
    try {
      const res = await apiClient.post<EnrollmentCode>(`/projects/${projectId}/codes`);
      setActiveCode(res.data);
      setCodeOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar código');
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Secure Fair – Socioformador
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.full_name}
          </Typography>
          <Chip label="SOCIO" color="secondary" size="small" sx={{ mr: 2 }} />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mis Proyectos
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Typography color="text.secondary">No tienes proyectos asignados.</Typography>
        ) : (
          <Grid container spacing={3}>
            {projects.map((p) => (
              <Grid xs={12} sm={6} md={4} key={p.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {p.name}
                      </Typography>
                      <Chip
                        label={p.is_active ? 'Activo' : 'Inactivo'}
                        color={p.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {p.description}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lugar:</strong> {p.location}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cap. por slot:</strong> {p.max_students_per_slot}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={
                        generatingFor === p.id ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <VpnKeyIcon />
                        )
                      }
                      disabled={!p.is_active || generatingFor !== null}
                      onClick={() => generateCode(p.id)}
                    >
                      Generar Código
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Active Code Dialog */}
      <Dialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Código de Inscripción</DialogTitle>
        <DialogContent>
          {activeCode && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography
                variant="h2"
                fontWeight="bold"
                letterSpacing={8}
                color={countdown > 10 ? 'primary' : 'error'}
                sx={{ fontFamily: 'monospace' }}
              >
                {activeCode.code}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Expira en{' '}
                <strong style={{ color: countdown > 10 ? 'inherit' : 'red' }}>
                  {countdown}s
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Comparte este código con los estudiantes presentes.
              </Typography>
            </Box>
          )}
          {!activeCode && (
            <Typography align="center" color="text.secondary">
              El código ha expirado.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
