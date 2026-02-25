// use projects and organizations to populate dropdowns in the admin edit page
// Admin will see a table of all students registered for each project, with the option to edit their information (name, matricula, carrera, correo, celular, hora), 
// project enrolled, organization enrolled
// Admin will also be able to filter students by project and organization, and search for specific students by name or matricula.
// Admin can also delete or add students manually, in case of any issues with the import process.
// Admin can delete and add project or organization and edit their information.
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const API_BASE = "http://localhost:5000/api";

const AdminEdit = () => {
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    carrera: "",
    correo: "",
    celular: "",
    hora: "",
    projectId: "",
    organizationId: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const studentsRes = await fetch(`${API_BASE}/students`);
      const projectsRes = await fetch(`${API_BASE}/projects`);
      const orgsRes = await fetch(`${API_BASE}/organizations`);

      const studentsData = await studentsRes.json();
      const projectsData = await projectsRes.json();
      const orgsData = await orgsRes.json();

      setStudents(studentsData);
      setProjects(projectsData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        matricula: "",
        carrera: "",
        correo: "",
        celular: "",
        hora: "",
        projectId: "",
        organizationId: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingStudent) {
        await fetch(`${API_BASE}/students/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`${API_BASE}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setOpen(false);
      fetchAll();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/students/${id}`, {
        method: "DELETE",
      });
      fetchAll();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const filteredStudents = students
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.matricula?.includes(search)
    )
    .filter((s) =>
      filterProject ? s.projectId === filterProject : true
    )
    .filter((s) =>
      filterOrg ? s.organizationId === filterOrg : true
    );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Admin Panel
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={filterProject}
            displayEmpty
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <MenuItem value="">Todos los proyectos</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filterOrg}
            displayEmpty
            onChange={(e) => setFilterOrg(e.target.value)}
          >
            <MenuItem value="">Todas las organizaciones</MenuItem>
            {organizations.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" onClick={() => handleOpen()}>
            + Add Student
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Matrícula</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Organización</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.matricula}</TableCell>
                <TableCell>
                  {projects.find((p) => p.id === s.projectId)?.name}
                </TableCell>
                <TableCell>
                  {organizations.find((o) => o.id === s.organizationId)?.name}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(s)}>Edit</Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {editingStudent ? "Edit Student" : "Add Student"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <TextField
            label="Matrícula"
            value={formData.matricula}
            onChange={(e) =>
              setFormData({ ...formData, matricula: e.target.value })
            }
          />

          <Select
            value={formData.projectId}
            onChange={(e) =>
              setFormData({ ...formData, projectId: e.target.value })
            }
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={formData.organizationId}
            onChange={(e) =>
              setFormData({ ...formData, organizationId: e.target.value })
            }
          >
            {organizations.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEdit;