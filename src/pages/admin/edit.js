// use projects and organizations to populate dropdowns in the admin edit page
// Admin will see a table of all students registered for each project, with the option to edit their information (name, matricula, carrera, correo, celular, hora), 
// project enrolled, organization enrolled
// Admin will also be able to filter students by project and organization, and search for specific students by name or matricula.
// Admin can also delete or add students manually, in case of any issues with the import process.
// Admin can delete and add project or organization and edit their information.
import React, { useState } from "react";
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
  DialogActions
} from "@mui/material";

// Import data base
import { students as studentsData } from "../students.js";
import { projects as projectsData } from "../projects.js";
import { organizations as orgsData } from "../organization.js";

const AdminEdit = () => {
  // Convertir objetos a array mapeando ids
  const [students, setStudents] = useState(
    Object.values(studentsData).map((s) => ({
      ...s,
      id: s.user_id,
      name: s.nombre,
      matricula: s.matricula,
      projectId: s.project_id,
      organizationId: s.orgID,
      correo: s.correo,
      telefono: s.telefono,
      registeredAt: s.registered_at,
    }))
  );

  const [projects, setProjects] = useState(
    Object.values(projectsData).map((p, index) => ({
      ...p,
      id: index + 1,
      name: Object.keys(projectsData)[index],
    }))
  );

  const [organizations, setOrganizations] = useState(
    Object.values(orgsData).map((o) => ({
      ...o,
      id: o.orgID,
      name: o.name_org,
    }))
  );

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  // Para diálogos
  const [openStudent, setOpenStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formStudent, setFormStudent] = useState({
    name: "",
    matricula: "",
    projectId: "",
    organizationId: "",
    correo: "",
    telefono: "",
    registeredAt: "",
  });

  const [openProject, setOpenProject] = useState(false);
  const [formProject, setFormProject] = useState({
    name: "",
    description: "",
    rules: "",
    capacity: "",
    registered: 0,
    checkedIn: 0,
    organization: "",
  });

  const [openOrg, setOpenOrg] = useState(false);
  const [formOrg, setFormOrg] = useState({
    name: "",
    createdAt: "",
  });

  // --- Estudiantes ---
  const handleOpenStudent = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormStudent({ ...student });
    } else {
      setEditingStudent(null);
      setFormStudent({
        name: "",
        matricula: "",
        projectId: "",
        organizationId: "",
        correo: "",
        telefono: "",
        registeredAt: "",
      });
    }
    setOpenStudent(true);
  };

  const handleSaveStudent = () => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...formStudent } : s))
      );
    } else {
      const newStudent = {
        id: students.length + 1,
        ...formStudent,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    setOpenStudent(false);
  };

  const handleDeleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Proyectos ---
  const handleSaveProject = () => {
    const newProject = {
      ...formProject,
      id: projects.length + 1,
    };
    setProjects((prev) => [...prev, newProject]);
    setOpenProject(false);
    setFormProject({
      name: "",
      description: "",
      rules: "",
      capacity: "",
      registered: 0,
      checkedIn: 0,
      organization: "",
    });
  };

  // --- Organizaciones ---
  const handleSaveOrg = () => {
    const newOrg = {
      id: organizations.length + 1,
      name: formOrg.name,
      created_at: formOrg.createdAt,
    };
    setOrganizations((prev) => [...prev, newOrg]);
    setOpenOrg(false);
    setFormOrg({ name: "", createdAt: "" });
  };

  // --- Filtros ---
  const filteredStudents = students
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.matricula?.includes(search)
    )
    .filter((s) => (filterProject ? s.projectId === filterProject : true))
    .filter((s) => (filterOrg ? s.organizationId === filterOrg : true));

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Panel de Administración
      </Typography>

      {/* Botones de agregar proyecto y organización */}
      <Box display="flex" gap={2} mb={3}>
        <Button variant="contained" onClick={() => setOpenProject(true)}>
          + Agregar Proyecto
        </Button>
        <Button variant="contained" onClick={() => setOpenOrg(true)}>
          + Agregar Organización
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="Buscar estudiante"
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

          <Button variant="contained" onClick={() => handleOpenStudent()}>
            + Agregar Estudiante
          </Button>
        </Box>
      </Paper>

      {/* Tabla de estudiantes */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Matrícula</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Organización</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Hora de Registro</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.matricula}</TableCell>
                <TableCell>{projects.find((p) => p.id === s.projectId)?.name}</TableCell>
                <TableCell>{organizations.find((o) => o.id === s.organizationId)?.name}</TableCell>
                <TableCell>{s.correo}</TableCell>
                <TableCell>{s.telefono}</TableCell>
                <TableCell>{s.registeredAt}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenStudent(s)}>Editar</Button>
                  <Button color="error" onClick={() => handleDeleteStudent(s.id)}>
                    Borrar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog Estudiante */}
      <Dialog open={openStudent} onClose={() => setOpenStudent(false)}>
        <DialogTitle>{editingStudent ? "Editar Estudiante" : "Agregar Estudiante"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            value={formStudent.name}
            onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
          />
          <TextField
            label="Matrícula"
            value={formStudent.matricula}
            onChange={(e) => setFormStudent({ ...formStudent, matricula: e.target.value })}
          />
          <TextField
            label="Correo"
            value={formStudent.correo}
            onChange={(e) => setFormStudent({ ...formStudent, correo: e.target.value })}
          />
          <TextField
            label="Teléfono"
            value={formStudent.telefono}
            onChange={(e) => setFormStudent({ ...formStudent, telefono: e.target.value })}
          />
          <TextField
            label="Hora de Registro"
            type="datetime-local"
            value={formStudent.registeredAt}
            onChange={(e) => setFormStudent({ ...formStudent, registeredAt: e.target.value })}
          />

          <Select
            value={formStudent.projectId}
            onChange={(e) => setFormStudent({ ...formStudent, projectId: e.target.value })}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={formStudent.organizationId}
            onChange={(e) => setFormStudent({ ...formStudent, organizationId: e.target.value })}
          >
            {organizations.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudent(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveStudent}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Proyecto */}
      <Dialog open={openProject} onClose={() => setOpenProject(false)}>
        <DialogTitle>Agregar Proyecto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre Proyecto"
            value={formProject.name}
            onChange={(e) => setFormProject({ ...formProject, name: e.target.value })}
          />
          <TextField
            label="Descripción"
            value={formProject.description}
            onChange={(e) => setFormProject({ ...formProject, description: e.target.value })}
          />
          <TextField
            label="Reglas"
            value={formProject.rules}
            onChange={(e) => setFormProject({ ...formProject, rules: e.target.value })}
          />
          <TextField
            label="Capacidad"
            type="number"
            value={formProject.capacity}
            onChange={(e) => setFormProject({ ...formProject, capacity: e.target.value })}
          />
          <Select
            value={formProject.organization}
            onChange={(e) => setFormProject({ ...formProject, organization: e.target.value })}
          >
            {organizations.map((o) => (
              <MenuItem key={o.id} value={o.name}>
                {o.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProject(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveProject}>
            Guardar Proyecto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Organización */}
      <Dialog open={openOrg} onClose={() => setOpenOrg(false)}>
        <DialogTitle>Agregar Organización</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre Organización"
            value={formOrg.name}
            onChange={(e) => setFormOrg({ ...formOrg, name: e.target.value })}
          />
          <TextField
            label="Fecha de Creación"
            type="date"
            value={formOrg.createdAt}
            onChange={(e) => setFormOrg({ ...formOrg, createdAt: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrg(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveOrg}>
            Guardar Organización
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEdit;