/**
 * AdminDashboard
 *
 * Main admin panel showing summary stats and navigation to:
 *   - Organizations CRUD
 *   - Projects CRUD
 *   - Enrollments table
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';

interface Organization {
  id: number;
  name: string;
  contact_email: string | null;
}

interface Project {
  id: number;
  name: string;
  organization_id: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsRes, projectsRes] = await Promise.all([
          apiClient.get<Organization[]>('/organizations/'),
          apiClient.get<Project[]>('/projects/'),
        ]);
        setOrgs(orgsRes.data);
        setProjects(projectsRes.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Top bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Secure Fair – Administración
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.full_name}
          </Typography>
          <Chip label="ADMIN" color="secondary" size="small" sx={{ mr: 2 }} />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard de Administración
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
        ) : (
          <Grid container spacing={3}>
            {/* Summary cards */}
            <Grid xs={12} sm={4}>
              <Card elevation={3}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {orgs.length}
                    </Typography>
                    <Typography color="text.secondary">Organizaciones</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid xs={12} sm={4}>
              <Card elevation={3}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {projects.length}
                    </Typography>
                    <Typography color="text.secondary">Proyectos</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid xs={12} sm={4}>
              <Card elevation={3}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {projects.filter((p) => p.is_active).length}
                    </Typography>
                    <Typography color="text.secondary">Proyectos Activos</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Organizations list */}
            <Grid xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Organizaciones
                  </Typography>
                  {orgs.length === 0 ? (
                    <Typography color="text.secondary">Sin organizaciones registradas.</Typography>
                  ) : (
                    orgs.map((org) => (
                      <Box
                        key={org.id}
                        sx={{ py: 1, borderBottom: '1px solid #eee', '&:last-child': { border: 0 } }}
                      >
                        <Typography fontWeight="medium">{org.name}</Typography>
                        {org.contact_email && (
                          <Typography variant="body2" color="text.secondary">
                            {org.contact_email}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Projects list */}
            <Grid xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Proyectos
                  </Typography>
                  {projects.length === 0 ? (
                    <Typography color="text.secondary">Sin proyectos registrados.</Typography>
                  ) : (
                    projects.map((p) => (
                      <Box
                        key={p.id}
                        sx={{
                          py: 1,
                          borderBottom: '1px solid #eee',
                          '&:last-child': { border: 0 },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography fontWeight="medium">{p.name}</Typography>
                        <Chip
                          label={p.is_active ? 'Activo' : 'Inactivo'}
                          color={p.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
