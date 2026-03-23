// use projects and organizations to populate dropdowns in the admin edit page
// Admin will see a table of all students registered for each project, with the option to edit their information (name, matricula, carrera, correo, celular, hora), 
// project enrolled, organization enrolled
// Admin will also be able to filter students by project and organization, and search for specific students by name or matricula.
// Admin can also delete or add students manually, in case of any issues with the import process.
// Admin can delete and add project or organization and edit their information.
import React, { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import * as storageService from '../../services/StorageService';

const AdminEdit = () => {
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  // Para diálogos
  const [openStudent, setOpenStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [formStudent, setFormStudent] = useState({
    nombre: "",
    apellidos: "",
    matricula: "",
    correo: "",
    celular: "",
    carrera: "",
    hora_registro: "",
    id_proyecto: "",
    id_organizacion: "",
  });

  // ✅ Cargar datos de localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const studsRaw = storageService.getEstudiantes() || [];
    const studs = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);
    
    const projs = storageService.getProyectos() || [];
    const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];

    setStudents(studs);
    setProjects(projs);
    setOrganizations(orgs);
  };

  // --- Estudiantes ---
  const handleOpenStudent = (student = null) => {
    if (student) {
      setEditingStudentId(student.id_usuario);
      setFormStudent({
        nombre: student.nombre || "",
        apellidos: student.apellidos || "",
        matricula: student.matricula || "",
        correo: student.correo || "",
        celular: student.celular || "",
        carrera: student.carrera || "",
        hora_registro: student.hora_registro || "",
        id_proyecto: student.id_proyecto || "",
        id_organizacion: student.id_organizacion || "",
      });
    } else {
      setEditingStudentId(null);
      setFormStudent({
        nombre: "",
        apellidos: "",
        matricula: "",
        correo: "",
        celular: "",
        carrera: "",
        hora_registro: "",
        id_proyecto: "",
        id_organizacion: "",
      });
    }
    setOpenStudent(true);
  };

  const handleSaveStudent = () => {
    if (editingStudentId) {
      // ✅ EDITAR: Encontrar el estudiante y actualizar
      const updated = students.map((s) =>
        s.id_usuario === editingStudentId
          ? {
              ...s,
              nombre: formStudent.nombre,
              apellidos: formStudent.apellidos,
              matricula: formStudent.matricula,
              correo: formStudent.correo,
              celular: formStudent.celular,
              carrera: formStudent.carrera,
              hora_registro: formStudent.hora_registro,
              id_proyecto: Number(formStudent.id_proyecto),
              id_organizacion: Number(formStudent.id_organizacion),
            }
          : s
      );
      setStudents(updated);
      localStorage.setItem("estudiantes", JSON.stringify(updated));
      console.log("Estudiante actualizado:", updated.find(s => s.id_usuario === editingStudentId));
    } else {
      // Agregar nuevo estudiante
      const newStudent = {
        id_usuario: Math.random().toString(36).substr(2, 9),
        username: formStudent.matricula.toLowerCase(),
        nombre: formStudent.nombre,
        apellidos: formStudent.apellidos,
        matricula: formStudent.matricula,
        correo: formStudent.correo,
        celular: formStudent.celular,
        carrera: formStudent.carrera,
        hora_registro: formStudent.hora_registro,
        id_proyecto: Number(formStudent.id_proyecto),
        id_organizacion: Number(formStudent.id_organizacion),
        registered_at: new Date().toISOString().split("T")[0],
        checked_in_at: null,
      };
      const updated = [...students, newStudent];
      setStudents(updated);
      localStorage.setItem("estudiantes", JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('studentUpdated'));
    setOpenStudent(false);
  };

  const handleDeleteStudent = (id) => {
    const updated = students.filter((s) => s.id_usuario !== id);
    setStudents(updated);
    localStorage.setItem("estudiantes", JSON.stringify(updated));
    window.dispatchEvent(new Event('studentUpdated'));
  };

  // --- Filtros ---
  const filteredStudents = students
    .filter(
      (s) =>
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.matricula?.includes(search)
    )
    .filter((s) => (filterProject ? Number(s.id_proyecto) === Number(filterProject) : true))
    .filter((s) => (filterOrg ? Number(s.id_organizacion) === Number(filterOrg) : true));

  // Obtener nombre de proyecto
  const getProjectName = (id) => {
    const proj = projects.find((p) => p.id_proyecto === id);
    return proj ? proj.nombre_proyecto : "N/A";
  };

  // Obtener nombre de organización
  const getOrgName = (id) => {
    const org = organizations.find((o) => o.id_organizacion === id);
    return org ? org.nombre_osf : "N/A";
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Administrar Estudiantes
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="Buscar estudiante"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <Select
            value={filterProject}
            displayEmpty
            onChange={(e) => setFilterProject(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos los proyectos</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id_proyecto} value={p.id_proyecto}>
                {p.nombre_proyecto}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filterOrg}
            displayEmpty
            onChange={(e) => setFilterOrg(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas las organizaciones</MenuItem>
            {organizations.map((o) => (
              <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                {o.nombre_osf}
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
            <TableRow sx={{ backgroundColor: "#f0f9ff" }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Matrícula</strong></TableCell>
              <TableCell><strong>Carrera</strong></TableCell>
              <TableCell><strong>Correo</strong></TableCell>
              <TableCell><strong>Celular</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Hora Registro</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id_usuario}>
                <TableCell>{s.nombre} {s.apellidos || ""}</TableCell>
                <TableCell>{s.matricula}</TableCell>
                <TableCell>{s.carrera || "N/A"}</TableCell>
                <TableCell>{s.correo}</TableCell>
                <TableCell>{s.celular || "N/A"}</TableCell>
                <TableCell>{getProjectName(s.id_proyecto)}</TableCell>
                <TableCell>{getOrgName(s.id_organizacion)}</TableCell>
                <TableCell>{s.hora_registro || "N/A"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenStudent(s)}
                  />
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteStudent(s.id_usuario)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog Estudiante */}
      <Dialog open={openStudent} onClose={() => setOpenStudent(false)}>
        <DialogTitle>
          {editingStudentId ? "Editar Estudiante" : "Agregar Estudiante"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            fullWidth
            value={formStudent.nombre}
            onChange={(e) => setFormStudent({ ...formStudent, nombre: e.target.value })}
          />
          <TextField
            label="Apellidos"
            fullWidth
            value={formStudent.apellidos}
            onChange={(e) => setFormStudent({ ...formStudent, apellidos: e.target.value })}
          />
          <TextField
            label="Matrícula"
            fullWidth
            value={formStudent.matricula}
            onChange={(e) => setFormStudent({ ...formStudent, matricula: e.target.value })}
          />
          <TextField
            label="Correo"
            fullWidth
            value={formStudent.correo}
            onChange={(e) => setFormStudent({ ...formStudent, correo: e.target.value })}
          />
          <TextField
            label="Celular"
            fullWidth
            value={formStudent.celular}
            onChange={(e) => setFormStudent({ ...formStudent, celular: e.target.value })}
          />
          <TextField
            label="Carrera"
            fullWidth
            value={formStudent.carrera}
            onChange={(e) => setFormStudent({ ...formStudent, carrera: e.target.value })}
          />
          <TextField
            label="Hora de Registro"
            fullWidth
            value={formStudent.hora_registro}
            onChange={(e) => setFormStudent({ ...formStudent, hora_registro: e.target.value })}
          />

          <Select
            value={formStudent.id_proyecto}
            onChange={(e) => setFormStudent({ ...formStudent, id_proyecto: e.target.value })}
            displayEmpty
          >
            <MenuItem value="">Selecciona un proyecto</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id_proyecto} value={p.id_proyecto}>
                {p.nombre_proyecto}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={formStudent.id_organizacion}
            onChange={(e) => setFormStudent({ ...formStudent, id_organizacion: e.target.value })}
            displayEmpty
          >
            <MenuItem value="">Selecciona una organización</MenuItem>
            {organizations.map((o) => (
              <MenuItem key={o.id_organizacion} value={o.id_organizacion}>
                {o.nombre_osf}
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
    </Box>
  );
};

export default AdminEdit;