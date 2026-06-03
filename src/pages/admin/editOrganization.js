import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Select, Typography, Paper,
  Table, TableHead, TableRow, TableCell, TableBody, Alert, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE = () => `/api`;

const PERIODOS = ["Ago-Dic", "Ene-Jul", "Invierno", "Verano"]; // Orden alfabético

export default function EditOrganization() {
  const navigate = useNavigate();
  const [orgList, setOrgList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [openProject, setOpenProject] = useState(false);
  const [openOrg, setOpenOrg] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef(null);
  const [formData, setFormData] = useState({
    id_organizacion: "", nombre_proyecto: "", descripcion_proyecto: "",
    cupo_estudiantes: "", periodo: "", duracion: "", horas_acreditadas: "",
    lugar: "", inscritos: 0,
  });
  const [newOrgName, setNewOrgName] = useState("");

  const refreshData = async () => {
    try {
      const [orgsRes, projsRes] = await Promise.all([
        fetch(`${API_BASE()}/organizations`),
        fetch(`${API_BASE()}/projects`)
      ]);
      const orgsData = await orgsRes.json();
      const projsData = await projsRes.json();
      if (orgsData.success) { setOrgList(orgsData.data); localStorage.setItem("organizaciones", JSON.stringify(orgsData.data)); }
      if (projsData.success) { setProjectList(projsData.data); localStorage.setItem("proyectos", JSON.stringify(projsData.data)); window.dispatchEvent(new Event('projectsUpdated')); }
    } catch (err) {
      setOrgList(JSON.parse(localStorage.getItem("organizaciones")) || []);
      setProjectList(JSON.parse(localStorage.getItem("proyectos")) || []);
    }
  };

  useEffect(() => { refreshData(); }, []);

  // Mostrar TODOS los proyectos si no hay filtro, o filtrar por org seleccionada
  const filteredProjects = selectedOrg
    ? projectList.filter(p => Number(p.id_organizacion || p.org_id) === Number(selectedOrg))
    : [...projectList].sort((a, b) => (a.nombre_proyecto || a.name || '').localeCompare(b.nombre_proyecto || b.name || '', 'es'));

  const sortedOrgs = [...orgList].sort((a, b) => (a.nombre_osf || a.name || '').localeCompare(b.nombre_osf || b.name || '', 'es'));

  const handleEditProject = (project) => {
    setEditingId(project.id_proyecto || project.id);
    setFormData({
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
    setError(""); setOpenProject(true);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setSaving(true);
    try {
      const id = projectToDelete.id_proyecto || projectToDelete.id;
      const res = await fetch(`${API_BASE()}/projects/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { await refreshData(); setError(""); setSuccessMsg("Proyecto eliminado correctamente."); }
      else { setError(result.message || "Error al eliminar proyecto"); }
    } catch (err) { setError("Error de conexión al eliminar"); }
    setSaving(false); setOpenDeleteConfirm(false); setProjectToDelete(null);
  };

  const handleDeleteOrg = async (org) => {
    const orgId = org.id_organizacion || org.id;
    const orgName = org.nombre_osf || org.name;
    const orgProjects = projectList.filter(p => Number(p.id_organizacion || p.org_id) === Number(orgId));
    const msg = orgProjects.length > 0
      ? `¿Eliminar "${orgName}" y sus ${orgProjects.length} proyecto(s)? Esta acción es IRREVERSIBLE.`
      : `¿Eliminar la organización "${orgName}"?`;
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`${API_BASE()}/organizations/${orgId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { await refreshData(); setError(""); setSelectedOrg(""); setSuccessMsg("Organización eliminada correctamente."); }
      else { setError(result.message || "Error al eliminar organización"); }
    } catch (err) { setError("Error de conexión al eliminar organización"); }
  };

  const handleSaveProject = async () => {
    if (!formData.nombre_proyecto.trim()) { setError("El nombre del proyecto es requerido"); return; }
    if (!formData.id_organizacion) { setError("Debes seleccionar una organización"); return; }
    if (!formData.periodo) { setError("Debes seleccionar un periodo"); return; }

    setSaving(true); setError("");
    try {
      const payload = {
        name: formData.nombre_proyecto,
        nombre_proyecto: formData.nombre_proyecto,
        org_id: Number(formData.id_organizacion),
        id_organizacion: Number(formData.id_organizacion),
        description: formData.descripcion_proyecto || null,
        descripcion_proyecto: formData.descripcion_proyecto || null,
        capacity: Number(formData.cupo_estudiantes) || 30,
        cupo_estudiantes: Number(formData.cupo_estudiantes) || 30,
        duracion: formData.duracion || null,
        lugar: formData.lugar || null,
        // IMPORTANTE: pasar el nombre del periodo para que el backend lo resuelva a period_id
        periodo: formData.periodo,
        horas_acreditadas: formData.horas_acreditadas ? Number(formData.horas_acreditadas) : null,
      };

      const url = editingId ? `${API_BASE()}/projects/${editingId}` : `${API_BASE()}/projects`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();

      if (result.success) {
        await refreshData();
        setOpenProject(false);
        setSuccessMsg(editingId ? "Proyecto actualizado correctamente." : "Proyecto creado correctamente.");
      } else {
        setError(result.message || "Error al guardar el proyecto");
      }
    } catch (err) {
      setError("Error de conexión al guardar el proyecto");
    }
    setSaving(false);
  };

  const handleSaveOrganization = async () => {
    if (!newOrgName.trim()) { setError("El nombre de la organización es requerido"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE()}/organizations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName.trim() })
      });
      const result = await res.json();
      if (result.success) { await refreshData(); setNewOrgName(""); setOpenOrg(false); setSuccessMsg("Organización creada correctamente."); }
      else { setError(result.message || "Error al crear organización"); }
    } catch (err) { setError("Error de conexión"); }
    setSaving(false);
  };

  const getOrgName = (id) => {
    const org = orgList.find(o => Number(o.id_organizacion || o.id) === Number(id));
    return org ? (org.nombre_osf || org.name) : "N/A";
  };

  const openAddProject = () => {
    setEditingId(null);
    setFormData({
      id_organizacion: selectedOrg || "",
      nombre_proyecto: "", descripcion_proyecto: "",
      cupo_estudiantes: "", periodo: "", duracion: "",
      horas_acreditadas: "", lugar: "", inscritos: 0,
    });
    setError("");
    setOpenProject(true);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: "none", fontWeight: 500 }}>Volver</Button>
      </Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>Gestión de Organizaciones y Proyectos</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          {/* Selector de organización — ORDENADO ALFABÉTICAMENTE */}
          <Select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} displayEmpty sx={{ minWidth: 220 }}>
            <MenuItem value="">Todas las organizaciones</MenuItem>
            {sortedOrgs.map(org => (
              <MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>
                {org.nombre_osf || org.name}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddProject}>
            Agregar Proyecto
          </Button>

          {selectedOrg && (
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => {
              const org = orgList.find(o => Number(o.id_organizacion || o.id) === Number(selectedOrg));
              if (org) handleDeleteOrg(org);
            }}>
              Eliminar Organización
            </Button>
          )}

          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setError(""); setOpenOrg(true); }} sx={{ fontWeight: 600 }}>
            Agregar Organización
          </Button>

          {/* Excel Import */}
          <input ref={importInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setImporting(true);
              try {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch(`${API_BASE()}/projects/import-excel`, { method: 'POST', body: fd });
                const result = await res.json();
                setImportResult(result);
                if (result.success) await refreshData();
              } catch (err) {
                setImportResult({ success: false, message: err.message });
              } finally {
                setImporting(false);
                e.target.value = '';
              }
            }}
          />
          <Button
            variant="contained" color="success"
            startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
            onClick={() => importInputRef.current?.click()}
            disabled={importing} sx={{ fontWeight: 600 }}
          >
            {importing ? 'Importando...' : 'Importar Excel'}
          </Button>
        </Box>
      </Paper>

      {importResult && (
        <Alert severity={importResult.success ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setImportResult(null)}>
          {importResult.success
            ? `✅ Importación completa: ${importResult.created} proyectos creados, ${importResult.orgsCreated || 0} organizaciones nuevas, ${importResult.skipped} omitidos.${importResult.errors?.length ? ' Errores: ' + importResult.errors.slice(0, 3).join('; ') : ''}`
            : `❌ Error: ${importResult.message}`}
        </Alert>
      )}

      <Paper>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f9ff" }}>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Periodo</strong></TableCell>
              <TableCell><strong>Capacidad</strong></TableCell>
              <TableCell><strong>Inscritos</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.length > 0 ? filteredProjects.map(project => (
              <TableRow key={project.id_proyecto || project.id} hover>
                <TableCell>{getOrgName(project.id_organizacion || project.org_id)}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{project.nombre_proyecto || project.name}</TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.descripcion_proyecto || project.description || "—"}
                </TableCell>
                <TableCell>
                  {project.periodo || "Sin periodo"}
                </TableCell>
                <TableCell>{project.cupo_estudiantes || project.capacity || "N/A"}</TableCell>
                <TableCell>{project.inscritos || 0}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small" variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditProject(project)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => { setProjectToDelete(project); setOpenDeleteConfirm(true); }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    {projectList.length === 0 ? "No hay proyectos registrados" : "No hay proyectos para esta organización"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ======================================== */}
      {/* Dialog: Agregar / Editar Proyecto         */}
      {/* ======================================== */}
      <Dialog open={openProject} onClose={() => setOpenProject(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Editar Proyecto" : "Agregar Proyecto"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          {/* Organización — ORDENADA ALFABÉTICAMENTE */}
          <TextField
            select
            label="Organización *"
            fullWidth
            value={formData.id_organizacion}
            onChange={e => setFormData({ ...formData, id_organizacion: e.target.value })}
          >
            <MenuItem value="">Selecciona una organización</MenuItem>
            {sortedOrgs.map(org => (
              <MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>
                {org.nombre_osf || org.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Nombre del Proyecto *"
            fullWidth
            value={formData.nombre_proyecto}
            onChange={e => setFormData({ ...formData, nombre_proyecto: e.target.value })}
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={formData.descripcion_proyecto}
            onChange={e => setFormData({ ...formData, descripcion_proyecto: e.target.value })}
          />

          <TextField
            label="Capacidad (# estudiantes)"
            type="number"
            fullWidth
            value={formData.cupo_estudiantes}
            onChange={e => setFormData({ ...formData, cupo_estudiantes: e.target.value })}
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Duración"
            fullWidth
            value={formData.duracion || ""}
            onChange={e => setFormData({ ...formData, duracion: e.target.value })}
            placeholder="Ej: 200 horas, 4 semanas..."
          />

          <TextField
            label="Lugar"
            fullWidth
            value={formData.lugar || ""}
            onChange={e => setFormData({ ...formData, lugar: e.target.value })}
          />

          {/* Periodo — SELECTOR CORRECTO que el backend sí procesa */}
          <TextField
            select
            label="Periodo *"
            fullWidth
            value={formData.periodo || ""}
            onChange={e => setFormData({ ...formData, periodo: e.target.value })}
            helperText="El periodo determina en qué semestre se realiza el proyecto"
          >
            <MenuItem value="">Selecciona un periodo</MenuItem>
            {PERIODOS.map(p => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Horas Acreditadas"
            type="number"
            fullWidth
            value={formData.horas_acreditadas || ""}
            onChange={e => setFormData({ ...formData, horas_acreditadas: e.target.value })}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProject(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveProject} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================== */}
      {/* Dialog: Agregar Organización             */}
      {/* ======================================== */}
      <Dialog open={openOrg} onClose={() => setOpenOrg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { p: 2, borderRadius: 3 } }}>
        <DialogTitle>Agregar Organización</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <TextField
            label="Nombre de la Organización"
            fullWidth
            value={newOrgName}
            onChange={e => setNewOrgName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveOrganization(); }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrg(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveOrganization} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================== */}
      {/* Dialog: Confirmar eliminación proyecto   */}
      {/* ======================================== */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dc2626" }}>
          <WarningIcon /> Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>Esta acción es irreversible y eliminará todas las inscripciones del proyecto.</Alert>
          <Typography>¿Eliminar <strong>{projectToDelete?.nombre_proyecto || projectToDelete?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteProject} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}