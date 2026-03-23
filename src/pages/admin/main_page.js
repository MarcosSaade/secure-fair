import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Grid
} from "@mui/material";

import TableAdmin from "../../components/TableAdmin";

const MainPage = () => {
  const navigate = useNavigate();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);

  // -------------------------
  // States
  // -------------------------
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [studentMatricula, setStudentMatricula] = useState("");
  const [studentName, setStudentName] = useState("");


  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
    const projs = JSON.parse(localStorage.getItem("proyectos")) || [];
    const studsRaw= JSON.parse(localStorage.getItem("estudiantes")) || [];

    const studs = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);

    setOrganizaciones(orgs);
    setProjects(projs);
    setStudents(studs);
  }, []);

    // Filters for students
    const filteredStudents = students.filter(s => {
      const matchesOrg = selectedOrg ? s.id_organizacion === Number(selectedOrg) : true;

      const fullName = `${s.nombre || ""} ${s.apellidos || ""}`.toLowerCase();
      
      const matchesName = studentName ? (fullName.includes(studentName.toLowerCase())) : true;
      const matchesProject = selectedProject ? s.id_proyecto === Number(selectedProject) : true;
      const matchesMatricula = studentMatricula ? (s.matricula?.toLowerCase().includes(studentMatricula.toLowerCase())) : true;
      return matchesOrg && matchesProject && matchesMatricula && matchesName;
    });
          


  // -------------------------
  // Mock Data
  // -------------------------
  //const organizaciones = [
  //  "Organización 1",
   // "Organización 2",
  //  "Organización 3",
   // "Organización 4",
  //];

  //const projects = {
  //  "Organización 1": ["Proyecto A", "Proyecto B"],
    //"Organización 2": ["Proyecto C", "Proyecto D"],
    //"Organización 3": ["Proyecto E", "Proyecto F"],
    //"Organización 4": ["Proyecto G", "Proyecto H"],
  //};

  // -------------------------
  // Navigation
  // -------------------------
  const handleCheckIn = () => navigate("/admin/checkin");
  const handleProfile = () => navigate("/admin/profile");
  const handleEdit = () => navigate("/admin/edit");
  const handleEditOrganization = () => navigate("/admin/editOrganization");

  const handleImport = () => {
    console.log("Importing data...");
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };


  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard de Administración
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Gestiona estudiantes, proyectos y organizaciones desde esta vista.
      </Typography>

      {/* ACTION BUTTONS */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleCheckIn}>
          Check-In
        </Button>
        <Button variant="contained" onClick={handleProfile}>
          Perfil Admin
        </Button>
        <Button variant="contained" onClick={handleEdit}>
          Editar Estudiantes
        </Button>
        <Button variant="contained" color="info" onClick={handleEditOrganization}>
          Editar Proyectos
        </Button>
        <Button variant="outlined" onClick={handleImport}>
          Importar Datos
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          Exportar Datos
        </Button>
      </Box>

      {/* FILTER SECTION */}
      <Paper sx={{ mt: 5, p: 3, borderRadius: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={2}>
          {/* Organization Selector */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Buscar por organización"
              variant = "outlined"
              size = "small"
              fullWidth
              value={selectedOrg}
              onChange = {(e) => setSelectedOrg(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {organizaciones.map((org) => (
                <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                  {org.nombre_osf}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Project Selector */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Proyecto"
              variant = "outlined"
              size = "small"
              fullWidth
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {projects
                .filter((proj) =>
                  selectedOrg ? proj.id_organizacion === Number(selectedOrg) : true
                )
                .map((proj) => (
                  <MenuItem key={proj.id_proyecto} value={proj.id_proyecto}>
                    {proj.nombre_proyecto}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          {/* Student Name Filter */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Nombre del estudiante"
              fullWidth
              variant = "outlined"
              size = "small"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </Grid>


          {/* Student Matricula Filter */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Matrícula del estudiante"
              fullWidth
              variant = "outlined"
              size = "small"
              value={studentMatricula}
              onChange={(e) => setStudentMatricula(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* STUDENTS TABLE */}
      <Box sx={{ mt: 5 }}>
        <TableAdmin
        students={filteredStudents}
        projects={projects}
        organizations={organizaciones}
         selectedProject={selectedProject} />
      </Box>

      {/* STATISTICS DASHBOARD */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Estadísticas del Evento
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">150</Typography>
              <Typography color="text.secondary">
                Estudiantes Registrados
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">120</Typography>
              <Typography color="text.secondary">Check-Ins</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">8</Typography>
              <Typography color="text.secondary">Proyectos</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MainPage;
