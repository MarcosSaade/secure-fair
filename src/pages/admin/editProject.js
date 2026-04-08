import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from "@mui/material";

import * as storageService from '../../services/StorageService';
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // * Cargar datos de localStorage
  useEffect(() => {
    const storedProjects = storageService.getProyectos() || [];
    const storedOrgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
    
    setProjects(storedProjects);
    setOrganizations(storedOrgs);
  }, []);

  // FILTRADO
  const filteredProjects = projects.filter((project) => {
    const orgMatch = selectedOrg
      ? project.id_organizacion === Number(selectedOrg)
      : true;

    const projectMatch = selectedProject
      ? project.id_proyecto === Number(selectedProject)
      : true;

    return orgMatch && projectMatch;
  });

  // ELIMINAR
  const handleDelete = (id) => {
    const updated = projects.filter((project) => project.id_proyecto !== id);
    setProjects(updated);
    localStorage.setItem("proyectos", JSON.stringify(updated));
  };

  // EDITAR
  const handleEdit = (project) => {
    setEditingProject({ ...project });
    setOpen(true);
  };

  const handleCreate = () => {
    const newId = Math.max(...projects.map(p => p.id_proyecto), 0) + 1;
    setEditingProject({
      id_proyecto: newId,
      nombre_proyecto: "",
      id_organizacion: "",
      cupo_estudiantes: 0,
      inscritos: 0,
      descripcion_proyecto: "",
      duracion: "",
      horas_acreditadas: 0,
      lugar: ""
    });
    setIsCreating(true);
    setOpen(true);
  };

  const handleSave = () => {
    if (isCreating) {
      setProjects([...projects, editingProject]);
    } else {
      const updated = projects.map((project) =>
        project.id_proyecto === editingProject.id_proyecto ? editingProject : project
      );
      setProjects(updated);
    }
    
    localStorage.setItem("proyectos", JSON.stringify(isCreating ? [...projects, editingProject] : projects));
    setOpen(false);
    setIsCreating(false);
    window.dispatchEvent(new Event('projectsUpdated'));
  };

  // Obtener nombre de organización por ID
  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id_organizacion === orgId);
    return org ? org.nombre_osf : "N/A";
  };

  return (
    <Box p={4}>
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

      <Typography variant="h4" gutterBottom>
        Administrar Proyectos
      </Typography>

      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Agregar Proyecto
        </Button>
      </Box>

      {/* FILTROS */}
      <Box display="flex" gap={2} mb={3} fullWidth>
        <TextField
          select
          label="Filtrar por Organización"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
              {org.nombre_osf}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Filtrar por Proyecto"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id_proyecto} value={project.id_proyecto}>
              {project.nombre_proyecto}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* TABLA */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Cupo</strong></TableCell>
              <TableCell><strong>Inscritos</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id_proyecto}>
                <TableCell>{getOrgName(project.id_organizacion)}</TableCell>
                <TableCell>{project.nombre_proyecto}</TableCell>
                <TableCell>{project.cupo_estudiantes}</TableCell>
                <TableCell>{project.inscritos}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleEdit(project)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(project.id_proyecto)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xl" PaperProps={{ style: { maxHeight: "90vh", overflowY: "auto" } }}>
        <DialogTitle>
          {isCreating ? "Agregar Proyecto" : "Editar Proyecto"}
        </DialogTitle>
        <DialogContent
          dividers
           sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, p: 3, fullWidth, maxHeight: "80vh", overflowY: "auto" }}>
          <TextField
            label="Nombre del Proyecto"
            value={editingProject?.nombre_proyecto || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                nombre_proyecto: e.target.value
              })
            }
          />

          <TextField
            select
            label="Organización"
            value={editingProject?.id_organizacion || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                id_organizacion: Number(e.target.value)
              })
            }
          >
            <MenuItem value="">Selecciona una organización</MenuItem>
            {organizations.map((org) => (
              <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                {org.nombre_osf}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Cupo"
            value={editingProject?.cupo_estudiantes || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                cupo_estudiantes: Number(e.target.value)
              })
            }
          />

          <TextField
            type="number"
            label="Inscritos"
            value={editingProject?.inscritos || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                inscritos: Number(e.target.value)
              })
            }
          />

          <TextField
            label="Descripción"
            multiline
            rows={3}
            value={editingProject?.descripcion_proyecto || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                descripcion_proyecto: e.target.value
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditProject;