import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE = () => `/api`;

const EditProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshData = async () => {
    try {
      const [projsRes, orgsRes] = await Promise.all([
        fetch(`${API_BASE()}/projects`),
        fetch(`${API_BASE()}/organizations`)
      ]);
      const projsData = await projsRes.json();
      const orgsData = await orgsRes.json();
      if (projsData.success) { setProjects(projsData.data); localStorage.setItem("proyectos", JSON.stringify(projsData.data)); }
      if (orgsData.success) { setOrganizations(orgsData.data); localStorage.setItem("organizaciones", JSON.stringify(orgsData.data)); }
    } catch (err) {
      setProjects(JSON.parse(localStorage.getItem("proyectos")) || []);
      setOrganizations(JSON.parse(localStorage.getItem("organizaciones")) || []);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const filteredProjects = projects.filter(p => {
    const orgMatch = selectedOrg ? Number(p.id_organizacion || p.org_id) === Number(selectedOrg) : true;
    const projMatch = selectedProject ? Number(p.id_proyecto || p.id) === Number(selectedProject) : true;
    return orgMatch && projMatch;
  });

  const handleDelete = async (project) => {
    if (!window.confirm(`¿Eliminar el proyecto "${project.nombre_proyecto || project.name}" y todas sus inscripciones?`)) return;
    try {
      const id = project.id_proyecto || project.id;
      const res = await fetch(`${API_BASE()}/projects/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { setError(""); await refreshData(); window.dispatchEvent(new Event('projectsUpdated')); }
      else { setError(result.message || "Error al eliminar"); }
    } catch (err) { setError("Error de conexión al eliminar proyecto"); }
  };

  const handleCreate = () => {
    setEditingProject({ id_proyecto: null, nombre_proyecto: "", id_organizacion: "", cupo_estudiantes: 0, inscritos: 0, descripcion_proyecto: "" });
    setIsCreating(true); setError(""); setOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject({
      ...project,
      id_organizacion: Number(project.id_organizacion || project.org_id) || "",
      nombre_proyecto: project.nombre_proyecto || project.name || "",
      descripcion_proyecto: project.descripcion_proyecto || project.description || "",
      cupo_estudiantes: project.cupo_estudiantes || project.capacity || "",
      duracion: project.duracion || project.duration || "",
      lugar: project.lugar || project.location || "",
      horas_acreditadas: project.horas_acreditadas || project.accredited_hours || "",
      periodo: project.periodo || ""
    });
    setIsCreating(false); setError(""); setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = {
        name: editingProject.nombre_proyecto,
        nombre_proyecto: editingProject.nombre_proyecto,
        org_id: Number(editingProject.id_organizacion),
        id_organizacion: Number(editingProject.id_organizacion),
        capacity: Number(editingProject.cupo_estudiantes),
        cupo_estudiantes: Number(editingProject.cupo_estudiantes),
        description: editingProject.descripcion_proyecto,
        descripcion_proyecto: editingProject.descripcion_proyecto,
        duracion: editingProject.duracion,
        lugar: editingProject.lugar,
        horas_acreditadas: Number(editingProject.horas_acreditadas) || null,
        periodo: editingProject.periodo || null,
      };
      const id = editingProject.id_proyecto || editingProject.id;
      const url = isCreating ? `${API_BASE()}/projects` : `${API_BASE()}/projects/${id}`;
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (result.success) { await refreshData(); window.dispatchEvent(new Event('projectsUpdated')); setOpen(false); setIsCreating(false); }
      else { setError(result.message || "Error al guardar"); }
    } catch (err) { setError("Error de conexión"); }
    setSaving(false);
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => Number(o.id_organizacion || o.id) === Number(orgId));
    return org ? (org.nombre_osf || org.name) : "N/A";
  };

  return (
    <Box p={4}>
      <Box mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: "none", fontWeight: 500 }}>Volver</Button>
      </Box>
      <Typography variant="h4" gutterBottom>Administrar Proyectos</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={handleCreate}>Agregar Proyecto</Button>
      </Box>
      <Box display="flex" gap={2} mb={3}>
        <TextField select label="Filtrar por Organización" value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Todas</MenuItem>
          {[...organizations].sort((a, b) => (a.nombre_osf || a.name || '').localeCompare(b.nombre_osf || b.name || '', 'es')).map(org => (<MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>{org.nombre_osf || org.name}</MenuItem>))}
        </TextField>
        <TextField select label="Filtrar por Proyecto" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Todos</MenuItem>
          {[...projects].sort((a, b) => (a.nombre_proyecto || a.name || '').localeCompare(b.nombre_proyecto || b.name || '', 'es')).map(p => (<MenuItem key={p.id_proyecto || p.id} value={p.id_proyecto || p.id}>{p.nombre_proyecto || p.name}</MenuItem>))}
        </TextField>
      </Box>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Período</strong></TableCell>
              <TableCell><strong>Duración</strong></TableCell>
              <TableCell><strong>Cupo</strong></TableCell>
              <TableCell><strong>Inscritos</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map(project => (
              <TableRow key={project.id_proyecto || project.id}>
                <TableCell>{getOrgName(project.id_organizacion || project.org_id)}</TableCell>
                <TableCell>{project.nombre_proyecto || project.name}</TableCell>
                <TableCell>{project.periodo || '—'}</TableCell>
                <TableCell>{project.duracion || project.duration || '—'}</TableCell>
                <TableCell>{project.cupo_estudiantes || project.capacity}</TableCell>
                <TableCell>{project.inscritos || 0}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => handleEdit(project)}>Editar</Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(project)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isCreating ? "Agregar Proyecto" : "Editar Proyecto"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Nombre del Proyecto" value={editingProject?.nombre_proyecto || ""} onChange={e => setEditingProject({ ...editingProject, nombre_proyecto: e.target.value })} />
          <TextField select label="Organización" value={editingProject?.id_organizacion || ""} onChange={e => setEditingProject({ ...editingProject, id_organizacion: Number(e.target.value) })}>
            <MenuItem value="">Selecciona una organización</MenuItem>
            {[...organizations].sort((a, b) => (a.nombre_osf || a.name || '').localeCompare(b.nombre_osf || b.name || '', 'es')).map(org => (<MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>{org.nombre_osf || org.name}</MenuItem>))}
          </TextField>
          <TextField type="number" label="Cupo" value={editingProject?.cupo_estudiantes || ""} onChange={e => setEditingProject({ ...editingProject, cupo_estudiantes: Number(e.target.value) })} />
          <TextField label="Descripción" multiline rows={3} value={editingProject?.descripcion_proyecto || ""} onChange={e => setEditingProject({ ...editingProject, descripcion_proyecto: e.target.value })} />
          <TextField label="Duración" value={editingProject?.duracion || ""} onChange={e => setEditingProject({ ...editingProject, duracion: e.target.value })} />
          <TextField label="Lugar" value={editingProject?.lugar || ""} onChange={e => setEditingProject({ ...editingProject, lugar: e.target.value })} />
          <TextField label="Horas Acreditadas" type="number" value={editingProject?.horas_acreditadas || ""} onChange={e => setEditingProject({ ...editingProject, horas_acreditadas: Number(e.target.value) })} />
          <TextField select label="Período" value={editingProject?.periodo || ""} onChange={e => setEditingProject({ ...editingProject, periodo: e.target.value })}>
            <MenuItem value="">Sin período</MenuItem>
            {['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setIsCreating(false); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={20} /> : "Guardar"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditProject;