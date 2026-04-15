import React, { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Container

} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'

import TableChartIcon from '@mui/icons-material/TableChart';


import TableAdmin from "../../components/TableAdmin";

const TableBec = () => {
  const navigate = useNavigate();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Estados
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [studentMatricula, setStudentMatricula] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentCarrera, setStudentCarrera] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
    const projs = JSON.parse(localStorage.getItem("proyectos")) || [];
    const studsRaw = JSON.parse(localStorage.getItem("estudiantes")) || [];

    const studs = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);

    setOrganizaciones(orgs);
    setProjects(projs);
    setStudents(studs);
  }, []);

  // Filtros de estudiantes
  const filteredStudents = students.filter(s => {
    let matchesOrg = true;
    if (selectedOrg) {
      // Check new format (enrollments array)
      if (Array.isArray(s.enrollments)  && s.enrollments.length > 0) {
        matchesOrg = s.enrollments.some(enrollment => enrollment.id_organizacion === Number(selectedOrg));
      }
      // Check old format (single id_organizacion)
      else if (s.id_organizacion) {
        matchesOrg = s.id_organizacion === Number(selectedOrg);
      } else {
        matchesOrg = false; // No organization info, so it doesn't match
      }
    }

    if (!matchesOrg) return false;
   
    const fullName = `${s.nombre || ""} ${s.apellidos || ""}`.toLowerCase();
    const matchesName = studentName ? (fullName.includes(studentName.toLowerCase())) : true;

    let matchesProject = true;
    if (selectedProject) {
      const selectedProjectNum = Number(selectedProject);
      // Check new format (enrollments array)
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        matchesProject = s.enrollments.some(enrollment => enrollment.id_proyecto === selectedProjectNum);
      }
      // Check old format (single id_proyecto)
      else if (s.id_proyecto) {
        matchesProject = s.id_proyecto === selectedProjectNum;
      }
    }

   
    const matchesMatricula = studentMatricula ? (s.matricula?.toLowerCase().includes(studentMatricula.toLowerCase())) : true;
    const matchesCarrera = studentCarrera ? (s.carrera?.toLowerCase().includes(studentCarrera.toLowerCase())) : true;
    let matchesPeriod = true;
    if (selectedPeriod) {
      // Handle new format (enrollments array)
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        matchesPeriod = s.enrollments.some((enrollment) => {
          const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
          return (enrollment.periodo || project?.periodo) === selectedPeriod;
        });
      } 
      // Handle old format (single id_proyecto)
      else if (s.id_proyecto) {
        const project = projects.find(p => p.id_proyecto === s.id_proyecto);
        matchesPeriod = project?.periodo === selectedPeriod;
      } 
      // No project enrolled
      else {
        matchesPeriod = false;
      }
    }
    
    return matchesOrg && matchesProject && matchesMatricula && matchesName && matchesPeriod && matchesCarrera;
  });

 

  // Obtener periodo del proyecto
  const getUniquePeriods = () => {
    const periods = new Set();
    
    students.forEach((s) => {
      // Handle new format (enrollments array)
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        s.enrollments.forEach((enrollment) => {
          const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
          const periodo = enrollment.periodo || project?.periodo;
          if (periodo) {
            periods.add(periodo);
          }
        });
      }
      // Handle old format (single id_proyecto)
      else if (s.id_proyecto) {
        const project = projects.find(p => p.id_proyecto === s.id_proyecto);
        if (project?.periodo) {
          periods.add(project.periodo);
        }
      }
    });
    
    return Array.from(periods).sort();
  };


  // Navegación
  const handleCheckIn = () => navigate("/becario/checkin_bec");
  const handleTable = () => navigate("/becario/table")



  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ================= LEFT SIDEBAR ================= */}
      {isSidebarOpen && (
        <Box
          sx={{
            width: 280,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            px: 4, // Horizontal padding
            pt: 0, // Top padding set to 0 to align with the top bar
            pb: 3, // Bottom padding
            transition: 'width 0.3s ease-in-out', // Smooth transition for sidebar width
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2, // Margin bottom for spacing from title
            }}
          >
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <MenuOpenIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}> {/* Added mt for spacing */}
            Opciones
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={handleCheckIn}>
              Check-In
            </Button>

          <Button fullWidth variant="contained" startIcon={<TableChartIcon />} onClick={handleTable}>
              Tabla de Datos
            </Button>
          </Box>
        </Box>
      )}

      {/* ================= RIGHT CONTENT ================= */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f7fa',
          p: 5,
          position: 'relative', // Needed for the show sidebar button
        }}
      >
        {!isSidebarOpen && (
          <IconButton
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Container maxWidth="xl">
          {/* HEADER */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Servicio Social - Becario
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Haz click en Check-In para que el estudiante pueda ingresar al evento.
          </Typography>

          {/* FILTER SECTION */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 3,
              mt: 6,
              mb: 4,
            }}
          >
            <TextField
              select
              label="Buscar por organización"
              fullWidth
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {organizaciones.map((org) => (
                <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
                  {org.nombre_osf}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Proyecto"
              fullWidth
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {projects
                .filter((proj) => (selectedOrg ? proj.id_organizacion === Number(selectedOrg) : true))
                .map((proj) => (
                  <MenuItem key={proj.id_proyecto} value={proj.id_proyecto}>
                    {proj.nombre_proyecto}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              label="Periodo"
              fullWidth
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniquePeriods().map((period) => (
                <MenuItem key={period} value={period}>
                  {period}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Nombre del estudiante" fullWidth value={studentName} onChange={(e) => setStudentName(e.target.value)} />

            <TextField
              label="Matrícula del estudiante"
              fullWidth
              value={studentMatricula}
              onChange={(e) => setStudentMatricula(e.target.value)}
            />

            <TextField
              label="Carrera del estudiante"
              fullWidth
              value={studentCarrera}
              onChange={(e) => setStudentCarrera(e.target.value)}
            />
          </Box>

          {/* TABLE */}
          <Box sx={{ mt: 5 }}>
            <TableAdmin students={filteredStudents} projects={projects} organizations={organizaciones} selectedProject={selectedProject} />
          </Box>
        </Container>
      </Box>
    </Box>
  )
};

export default TableBec;