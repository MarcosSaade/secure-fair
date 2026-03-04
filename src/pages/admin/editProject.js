import React, { useState } from "react";
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

import { organizations } from "../organization";
import { projects as projectsData } from "../projects";

const EditProject = () => {
    const [projects, setProjects] = useState(
    Object.entries(projectsData).map(([key, value]) => ({
      id: key,
      name: key,
      ...value
    }))
  );
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [open, setOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  //  FILTRADO
  const filteredProjects = projects.filter((project) => {
    const orgMatch = selectedOrg
      ? project.organization === selectedOrg
      : true;

    const projectMatch = selectedProject
      ? project.name === selectedProject
      : true;

    return orgMatch && projectMatch;
  });

  // ELIMINAR
  const handleDelete = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  //  EDITAR
  const handleEdit = (project) => {
    setEditingProject(project);
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingProject({
      id: Date.now().toString(),
      name: "",
      organization: "",
      capacity: 0,
      registered: 0
    });
    setIsCreating(true);
    setOpen(true);
  };

  const handleSave = () => {
    if (isCreating) {
      setProjects([...projects, editingProject]);
    } else {
      const updated = projects.map((project) =>
        project.id === editingProject.id ? editingProject : project
      );
      setProjects(updated);
    }

    setOpen(false);
    setIsCreating(false);
  };

  return (
    <Box p={4}>
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

      {/*  FILTROS */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          select
          label="Filtrar por Organización"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.orgID} value={org.name_org}>
              {org.name_org}
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
            <MenuItem key={project.id} value={project.name}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/*  TABLA */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Cupo</strong></TableCell>
              <TableCell><strong>Registrados</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.organization}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.capacity}</TableCell>
                <TableCell>{project.registered}</TableCell>
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
                    onClick={() => handleDelete(project.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/*  MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
            {isCreating ? "Agregar Proyecto" : "Editar Proyecto"}
          </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre del Proyecto"
            value={editingProject?.name || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                name: e.target.value
              })
            }
          />

          <TextField
            select
            label="Organización"
            value={editingProject?.organization || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                organization: e.target.value
              })
            }
          >
            {organizations.map((org) => (
              <MenuItem key={org.orgID} value={org.name_org}>
                {org.name_org}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Cupo"
            value={editingProject?.capacity || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                capacity: Number(e.target.value)
              })
            }
          />

          <TextField
            type="number"
            label="Registrados"
            value={editingProject?.registered || ""}
            onChange={(e) =>
              setEditingProject({
                ...editingProject,
                registered: Number(e.target.value)
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