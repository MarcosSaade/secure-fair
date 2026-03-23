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
  AppBar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Typography,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';
import { getErrorMessage } from '../../services/api';

interface Organization {
  id: number;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface Project {
  id: number;
  name: string;
  organization_id: number;
  description: string;
  location: string;
  max_students_per_slot: number;
  is_active: boolean;
}

interface OrganizationForm {
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
}

interface ProjectForm {
  organization_id: number;
  name: string;
  description: string;
  location: string;
  max_students_per_slot: number;
  is_active: boolean;
}

const EMPTY_ORG_FORM: OrganizationForm = {
  name: '',
  description: '',
  contact_email: '',
  contact_phone: '',
};

const EMPTY_PROJECT_FORM: ProjectForm = {
  organization_id: 0,
  name: '',
  description: '',
  location: '',
  max_students_per_slot: 30,
  is_active: true,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [orgForm, setOrgForm] = useState<OrganizationForm>(EMPTY_ORG_FORM);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(EMPTY_PROJECT_FORM);

  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    const [orgsRes, projectsRes] = await Promise.all([
      apiClient.get<Organization[]>('/organizations/'),
      apiClient.get<Project[]>('/projects/'),
    ]);
    setOrgs(orgsRes.data);
    setProjects(projectsRes.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchData();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const organizationName = (orgId: number) =>
    orgs.find((o) => o.id === orgId)?.name ?? `Organización #${orgId}`;

  const openCreateOrg = () => {
    setEditingOrg(null);
    setOrgForm(EMPTY_ORG_FORM);
    setOrgDialogOpen(true);
  };

  const openEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name,
      description: org.description ?? '',
      contact_email: org.contact_email ?? '',
      contact_phone: org.contact_phone ?? '',
    });
    setOrgDialogOpen(true);
  };

  const saveOrg = async () => {
    if (!orgForm.name.trim() || !orgForm.description.trim() || !orgForm.contact_email.trim() || !orgForm.contact_phone.trim()) {
      setError('Todos los campos de organización son obligatorios.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: orgForm.name.trim(),
        description: orgForm.description.trim(),
        contact_email: orgForm.contact_email.trim(),
        contact_phone: orgForm.contact_phone.trim(),
      };
      if (editingOrg) {
        await apiClient.put(`/organizations/${editingOrg.id}`, payload);
        setSuccess('Organización actualizada correctamente.');
      } else {
        await apiClient.post('/organizations/', payload);
        setSuccess('Organización creada correctamente.');
      }
      setOrgDialogOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteOrg = async (orgId: number) => {
    setDeletingId(`org-${orgId}`);
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/organizations/${orgId}`);
      setSuccess('Organización eliminada correctamente.');
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm({
      ...EMPTY_PROJECT_FORM,
      organization_id: orgs[0]?.id ?? 0,
    });
    setProjectDialogOpen(true);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      organization_id: project.organization_id,
      name: project.name,
      description: project.description,
      location: project.location,
      max_students_per_slot: project.max_students_per_slot,
      is_active: project.is_active,
    });
    setProjectDialogOpen(true);
  };

  const saveProject = async () => {
    if (
      !projectForm.organization_id ||
      !projectForm.name.trim() ||
      !projectForm.description.trim() ||
      !projectForm.location.trim() ||
      !projectForm.max_students_per_slot
    ) {
      setError('Todos los campos de proyecto son obligatorios.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editingProject) {
        await apiClient.put(`/projects/${editingProject.id}`, {
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          location: projectForm.location.trim(),
          max_students_per_slot: projectForm.max_students_per_slot,
          is_active: projectForm.is_active,
        });
        setSuccess('Proyecto actualizado correctamente.');
      } else {
        await apiClient.post('/projects/', {
          organization_id: projectForm.organization_id,
          name: projectForm.name.trim(),
          description: projectForm.description.trim(),
          location: projectForm.location.trim(),
          max_students_per_slot: projectForm.max_students_per_slot,
          is_active: projectForm.is_active,
        });
        setSuccess('Proyecto creado correctamente.');
      }
      setProjectDialogOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId: number) => {
    setDeletingId(`project-${projectId}`);
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/projects/${projectId}`);
      setSuccess('Proyecto eliminado correctamente.');
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

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
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Organizaciones
                    </Typography>
                    <Button size="small" variant="contained" onClick={openCreateOrg}>
                      Nueva
                    </Button>
                  </Box>
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
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button size="small" variant="outlined" onClick={() => openEditOrg(org)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={deletingId === `org-${org.id}`}
                            onClick={() => deleteOrg(org.id)}
                          >
                            Eliminar
                          </Button>
                        </Stack>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Proyectos
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={openCreateProject}
                      disabled={orgs.length === 0}
                    >
                      Nuevo
                    </Button>
                  </Box>
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
                        <Stack direction="row" spacing={1} sx={{ mt: 1, width: '100%' }}>
                          <Button size="small" variant="text" onClick={() => setViewingProject(p)}>
                            Ver
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => openEditProject(p)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={deletingId === `project-${p.id}`}
                            onClick={() => deleteProject(p.id)}
                          >
                            Eliminar
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <Dialog open={orgDialogOpen} onClose={() => setOrgDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOrg ? 'Editar Organización' : 'Nueva Organización'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={orgForm.name}
              onChange={(e) => setOrgForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              value={orgForm.description}
              onChange={(e) => setOrgForm((prev) => ({ ...prev, description: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Correo de contacto"
              type="email"
              placeholder="contacto@organizacion.com"
              value={orgForm.contact_email}
              onChange={(e) => setOrgForm((prev) => ({ ...prev, contact_email: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Teléfono de contacto"
              value={orgForm.contact_phone}
              onChange={(e) => setOrgForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrgDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveOrg} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Organización"
              value={projectForm.organization_id}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, organization_id: Number(e.target.value) }))}
              required
              fullWidth
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </TextField>
            <TextField
              label="Nombre"
              value={projectForm.name}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              value={projectForm.description}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Ubicación"
              value={projectForm.location}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, location: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Máx. estudiantes por slot"
              type="number"
              value={projectForm.max_students_per_slot}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, max_students_per_slot: Number(e.target.value) }))}
              required
              fullWidth
              inputProps={{ min: 1, max: 100 }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Activo</Typography>
              <Switch
                checked={projectForm.is_active}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveProject} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewingProject} onClose={() => setViewingProject(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Proyecto</DialogTitle>
        <DialogContent>
          {viewingProject && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography><strong>Nombre:</strong> {viewingProject.name}</Typography>
              <Typography><strong>Organización:</strong> {organizationName(viewingProject.organization_id)}</Typography>
              <Typography><strong>Descripción:</strong> {viewingProject.description}</Typography>
              <Typography><strong>Ubicación:</strong> {viewingProject.location}</Typography>
              <Typography>
                <strong>Capacidad por slot:</strong> {viewingProject.max_students_per_slot}
              </Typography>
              <Typography>
                <strong>Estado:</strong> {viewingProject.is_active ? 'Activo' : 'Inactivo'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingProject(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
