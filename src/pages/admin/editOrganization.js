import React, { useState } from "react";
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

import { organizations } from "../organization";
import { projects } from "../projects";

export default function EditOrganization() {
  //  Estados editables
  const [orgList, setOrgList] = useState(organizations);
  const [projectList, setProjectList] = useState(projects);

  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [openProject, setOpenProject] = useState(false);
  const [openOrg, setOpenOrg] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    org_id: "",
    name: "",
    description: "",
    rules: "",
    capacity: "",
  });

  const [newOrgName, setNewOrgName] = useState("");

  //  FILTRO
  const filteredProjects = projectList.filter((project) => {
    return (
      (selectedOrg === "" || project.org_id === Number(selectedOrg)) &&
      (selectedProject === "" || project.name === selectedProject)
    );
  });

  //  AGREGAR PROYECTO
  const handleAddProject = () => {
    setEditingId(null);
    setFormData({
      org_id: "",
      name: "",
      description: "",
      rules: "",
      capacity: "",
    });
    setOpenProject(true);
  };

  //  EDITAR PROYECTO
  const handleEditProject = (project) => {
    setEditingId(project.project_id);
    setFormData(project);
    setOpenProject(true);
  };

  //  ELIMINAR PROYECTO
  const handleDeleteProject = (id) => {
    setProjectList(projectList.filter((p) => p.project_id !== id));
  };

  //  GUARDAR PROYECTO
  const handleSaveProject = () => {
    if (!formData.name || !formData.org_id) return;

    if (editingId) {
      setProjectList(
        projectList.map((p) =>
          p.project_id === editingId ? { ...formData } : p
        )
      );
    } else {
      setProjectList([
        ...projectList,
        {
          ...formData,
          project_id: Date.now(),
          org_id: Number(formData.org_id),
        },
      ]);
    }

    setOpenProject(false);
  };

  //  AGREGAR ORGANIZACIÓN
  const handleSaveOrganization = () => {
    if (!newOrgName.trim()) return;

    const newOrg = {
      org_id: Date.now(),
      name_org: newOrgName,
      created_at: new Date().toISOString().split("T")[0],
    };

    setOrgList([...orgList, newOrg]);
    setNewOrgName("");
    setOpenOrg(false);
  };

  // COLUMNAS
  const columns = [
    {
      field: "organization",
      headerName: "Organización",
      flex: 1,
      renderCell: (params) => {
        const org = orgList.find(
          (o) => o.org_id === params.row.org_id
        );
        return org ? org.name_org : "";
      },
    },
    { field: "name", headerName: "Proyecto", flex: 1 },
    { field: "description", headerName: "Descripción", flex: 1 },
    { field: "rules", headerName: "Reglas", flex: 1 },
    { field: "capacity", headerName: "Capacidad", flex: 1 },
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
          >
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() =>
              handleDeleteProject(params.row.project_id)
            }
          >
          </Button>
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
              <MenuItem key={org.org_id} value={org.org_id}>
                {org.name_org}
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
              <MenuItem key={project.project_id} value={project.name}>
                {project.name}
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
          getRowId={(row) => row.project_id}
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
              value={formData.org_id}
              label="Organización"
              onChange={(e) =>
                setFormData({ ...formData, org_id: e.target.value })
              }
            >
              {orgList.map((org) => (
                <MenuItem key={org.org_id} value={org.org_id}>
                  {org.name_org}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nombre"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <TextField
            label="Descripción"
            fullWidth
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <TextField
            label="Reglas"
            fullWidth
            value={formData.rules}
            onChange={(e) =>
              setFormData({ ...formData, rules: e.target.value })
            }
          />

          <TextField
            label="Capacidad"
            type="number"
            fullWidth
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
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