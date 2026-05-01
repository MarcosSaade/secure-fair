import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


export default function EditOrganization() {
  const navigate = useNavigate();
  const [orgList, setOrgList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const periodos = ["Invierno", "Verano", "Ago-Dic", "Ene-Jul"];

  const [selectedOrg, setSelectedOrg] = useState("");

  const [openProject, setOpenProject] = useState(false);
  const [openOrg, setOpenOrg] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [formData, setFormData] = useState({
    id_organizacion: "",
    nombre_proyecto: "",
    descripcion_proyecto: "",
    cupo_estudiantes: "",
    periodo: "",
    duracion: "",
    horas_acreditadas: 0,
    lugar: "",
    inscritos: 0,
  });

  const [newOrgName, setNewOrgName] = useState("");

  //  Cargar datos de localStorage
  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
    const projs = JSON.parse(localStorage.getItem("proyectos")) || [];
    
    setOrgList(orgs);
    setProjectList(projs);
  }, []);

  //  Obtener proyectos de una organización específica
  const getProjectsByOrg = (orgId) => {
    if (!orgId) return projectList;
    return projectList.filter((p) => Number(p.id_organizacion) === Number(orgId));
  };

  //  FILTRO: Solo por organización
  const filteredProjects = getProjectsByOrg(selectedOrg);

  // AGREGAR PROYECTO
  const handleAddProject = () => {
    setEditingId(null);
    setFormData({
      id_organizacion: "",
      nombre_proyecto: "",
      descripcion_proyecto: "",
      cupo_estudiantes: "",
      duracion: "",
      horas_acreditadas: 0,
      lugar: "",
      inscritos: 0,
    });
    setOpenProject(true);
  };

  // EDITAR PROYECTO
  const handleEditProject = (project) => {
    setEditingId(project.id_proyecto);
    setFormData(project);
    setOpenProject(true);
  };

  //  Abrir diálogo de confirmación de eliminación
  const handleOpenDeleteConfirm = (project) => {
    setProjectToDelete(project);
    setOpenDeleteConfirm(true);
  };

  //  Confirmar eliminación
  const handleConfirmDeleteProject = () => {
    if (projectToDelete) {
      const updated = projectList.filter((p) => p.id_proyecto !== projectToDelete.id_proyecto);
      setProjectList(updated);
      localStorage.setItem("proyectos", JSON.stringify(updated));
      window.dispatchEvent(new Event('projectsUpdated'));
      console.log("Proyecto eliminado:", projectToDelete.nombre_proyecto);
    }
    setOpenDeleteConfirm(false);
    setProjectToDelete(null);
  };

  // GUARDAR PROYECTO
  const handleSaveProject = () => {
    if (!formData.nombre_proyecto || !formData.id_organizacion) {
      alert("El nombre del proyecto y la organización son requeridos");
      return;
    }

    let updated;
    if (editingId) {
      updated = projectList.map((p) =>
        p.id_proyecto === editingId ? { ...formData } : p
      );
    } else {
      updated = [
        ...projectList,
        {
          ...formData,
          id_proyecto: Math.max(...projectList.map(p => p.id_proyecto), 0) + 1,
          id_organizacion: Number(formData.id_organizacion),
        },
      ];
    }

    setProjectList(updated);
    localStorage.setItem("proyectos", JSON.stringify(updated));
    window.dispatchEvent(new Event('projectsUpdated'));
    setOpenProject(false);
  };

  // AGREGAR ORGANIZACIÓN
  const handleSaveOrganization = () => {
    if (!newOrgName.trim()) return;

    const newOrg = {
      id_organizacion: Math.max(...orgList.map(o => o.id_organizacion), 0) + 1,
      nombre_osf: newOrgName,
    };

    const updated = [...orgList, newOrg];
    setOrgList(updated);
    localStorage.setItem("organizaciones", JSON.stringify(updated));
    setNewOrgName("");
    setOpenOrg(false);
  };

  // Obtener nombre de organización
  const getOrgName = (id) => {
    const org = orgList.find((o) => o.id_organizacion === id);
    return org ? org.nombre_osf : "N/A";
  };

  return (
    <Box sx={{ padding: 4 }}>
        <Box mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
                  minWidth: "auto",
                  textTransform: "none",
                  fontWeight: 500
                }}
            >
            Volver
          </Button>
      </Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Gestión de Organizaciones y Proyectos
      </Typography>

      {/* FILTROS Y BOTONES */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* ✅ ORGANIZACIÓN FILTER */}
          <Select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas las organizaciones</MenuItem>
            {orgList.map((org) => (
              <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                {org.nombre_osf}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProject}
          >
            Agregar Proyecto
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenOrg(true)}
            size="large"
            sx={{
              minWidth: 220,
              fontSize: "0.95rem",
              fontWeight: 600,
              padding: "10px 16px"
            }}
          >
            Agregar Organización
          </Button>
        </Box>
      </Paper>

      {/* TABLA */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f9ff" }}>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Duración</strong></TableCell>
              <TableCell><strong>Lugar</strong></TableCell>
              <TableCell><strong>Periodo</strong></TableCell>
              <TableCell><strong>Horas Acreditadas</strong></TableCell>
              <TableCell><strong>Capacidad</strong></TableCell>
              <TableCell><strong>Inscritos</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <TableRow key={project.id_proyecto}>
                  <TableCell>{getOrgName(project.id_organizacion)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{project.nombre_proyecto}</TableCell>
                  <TableCell>{project.descripcion_proyecto}</TableCell>
                  <TableCell>{project.duracion || "N/A"}</TableCell>
                  <TableCell>{project.lugar || "N/A"}</TableCell>
                  <TableCell>
                    {typeof project.periodo === "number"
                      ? periodos[project.periodo]
                      : project.periodo || "N/A"}
                  </TableCell>
                  <TableCell>{project.horas_acreditadas || "N/A"}</TableCell>
                  <TableCell>{project.cupo_estudiantes || "N/A"}</TableCell>
                  <TableCell>{project.inscritos || 0}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditProject(project)}
                      sx={{ color: "#0369a1" }}
                    />
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDeleteConfirm(project)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="text.secondary">
                    {selectedOrg 
                      ? "No hay proyectos para esta organización" 
                      : "Selecciona una organización para ver sus proyectos"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* MODAL PROYECTO */}
      <Dialog 
        open={openProject} 
        onClose={() => setOpenProject(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId ? "Editar Proyecto" : "Agregar Proyecto"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/*  ORGANIZACIÓN - PRIMER DESPLEGABLE */}
          <Select
            value={formData.id_organizacion}
            onChange={(e) =>
              setFormData({ ...formData, id_organizacion: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">Selecciona una organización</MenuItem>
            {orgList.map((org) => (
              <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                {org.nombre_osf}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Nombre del Proyecto"
            fullWidth
            value={formData.nombre_proyecto}
            onChange={(e) =>
              setFormData({ ...formData, nombre_proyecto: e.target.value })
            }
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={formData.descripcion_proyecto}
            onChange={(e) =>
              setFormData({ ...formData, descripcion_proyecto: e.target.value })
            }
          />

          <TextField
            label="Capacidad"
            type="number"
            fullWidth
            value={formData.cupo_estudiantes}
            onChange={(e) =>
              setFormData({ ...formData, cupo_estudiantes: Number(e.target.value) })
            }
          />

          <TextField
            label="Duración"
            fullWidth
            value={formData.duracion || ""}
            onChange={(e) =>
              setFormData({ ...formData, duracion: e.target.value })
            }
          />

          <TextField
            label="Lugar"
            fullWidth
            value={formData.lugar || ""}
            onChange={(e) =>
              setFormData({ ...formData, lugar: e.target.value })
            }
          />

          <TextField
            select
            label="Periodo"
            fullWidth
            value={formData.periodo}
            onChange={(e) =>
              setFormData({ ...formData, periodo: e.target.value })
            }
          >
            <MenuItem value="">Selecciona un periodo</MenuItem>

            {periodos.map((p, index) => (
              <MenuItem key={index} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Horas Acreditadas"
            type="number"
            fullWidth
            value={formData.horas_acreditadas || ""}
            onChange={(e) =>
              setFormData({ ...formData, horas_acreditadas: Number(e.target.value) })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenProject(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveProject}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL ORGANIZACIÓN */}
              <Dialog
          open={openOrg}
          onClose={() => setOpenOrg(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              p: 2,
              borderRadius: 3
            }
          }}
        >
        <DialogTitle>Agregar Organización</DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Nombre de la Organización"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenOrg(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveOrganization}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/*  MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "#dc2626" }}>
          <WarningIcon />
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
             Esta acción es irreversible
          </Alert>
          <Typography>
            ¿Estás seguro de que deseas eliminar el proyecto <strong>{projectToDelete?.nombre_proyecto}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Organización: {getOrgName(projectToDelete?.id_organizacion)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteProject}
          >
            Eliminar Proyecto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}