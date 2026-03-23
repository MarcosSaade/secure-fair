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
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import * as storageService from '../../services/StorageService';

export default function EditOrganization() {
  const [orgList, setOrgList] = useState([]);
  const [projectList, setProjectList] = useState([]);

  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [openProject, setOpenProject] = useState(false);
  const [openOrg, setOpenOrg] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id_organizacion: "",
    nombre_proyecto: "",
    descripcion_proyecto: "",
    cupo_estudiantes: "",
  });

  const [newOrgName, setNewOrgName] = useState("");

  // ✅ Cargar datos de localStorage
  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
    const projs = storageService.getProyectos() || [];
    
    setOrgList(orgs);
    setProjectList(projs);
  }, []);

  // FILTRO
  const filteredProjects = projectList.filter((project) => {
    return (
      (selectedOrg === "" || Number(project.id_organizacion) === Number(selectedOrg)) &&
      (selectedProject === "" || project.nombre_proyecto === selectedProject)
    );
  });

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

  // ELIMINAR PROYECTO
  const handleDeleteProject = (id) => {
    const updated = projectList.filter((p) => p.id_proyecto !== id);
    setProjectList(updated);
    localStorage.setItem("proyectos", JSON.stringify(updated));
  };

  // GUARDAR PROYECTO
  const handleSaveProject = () => {
    if (!formData.nombre_proyecto || !formData.id_organizacion) return;

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

  // COLUMNAS
  const columns = [
    {
      field: "id_organizacion",
      headerName: "Organización",
      flex: 1,
      renderCell: (params) => {
        const org = orgList.find(
          (o) => o.id_organizacion === params.row.id_organizacion
        );
        return org ? org.nombre_osf : "N/A";
      },
    },
    { field: "nombre_proyecto", headerName: "Proyecto", flex: 1 },
    { field: "descripcion_proyecto", headerName: "Descripción", flex: 1 },
    { field: "cupo_estudiantes", headerName: "Capacidad", flex: 1 },
    { field: "inscritos", headerName: "Inscritos", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditProject(params.row)}
          />
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() =>
              handleDeleteProject(params.row.id_proyecto)
            }
          />
        </>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Organizaciones y Proyectos
      </Typography>

      {/* FILTROS Y BOTONES */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Organización</InputLabel>
          <Select
            value={selectedOrg}
            label="Organización"
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {orgList.map((org) => (
              <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                {org.nombre_osf}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Proyecto</InputLabel>
          <Select
            value={selectedProject}
            label="Proyecto"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {projectList.map((project) => (
              <MenuItem key={project.id_proyecto} value={project.nombre_proyecto}>
                {project.nombre_proyecto}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
        >
          Agregar Organización
        </Button>
      </Box>

      {/* TABLA */}
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={filteredProjects}
          columns={columns}
          getRowId={(row) => row.id_proyecto}
          pageSizeOptions={[5]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
        />
      </Box>

      {/* MODAL PROYECTO */}
      <Dialog open={openProject} onClose={() => setOpenProject(false)}>
        <DialogTitle>
          {editingId ? "Editar Proyecto" : "Agregar Proyecto"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Organización</InputLabel>
            <Select
              value={formData.id_organizacion}
              label="Organización"
              onChange={(e) =>
                setFormData({ ...formData, id_organizacion: e.target.value })
              }
            >
              {orgList.map((org) => (
                <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                  {org.nombre_osf}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nombre"
            fullWidth
            value={formData.nombre_proyecto}
            onChange={(e) =>
              setFormData({ ...formData, nombre_proyecto: e.target.value })
            }
          />

          <TextField
            label="Descripción"
            fullWidth
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
      <Dialog open={openOrg} onClose={() => setOpenOrg(false)}>
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
    </Box>
  );
}