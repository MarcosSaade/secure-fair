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
import AdminDashboardPanel from "../../components/dashboard"
import TableChartIcon from '@mui/icons-material/TableChart';


const MainPage = () => {
  const navigate = useNavigate();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Estados
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = `/api`;
        
        const [orgsRes, projsRes, studsRes] = await Promise.all([
          fetch(`${apiBase}/organizations`),
          fetch(`${apiBase}/projects`),
          fetch(`${apiBase}/students`)
        ]);

        const orgsData = await orgsRes.json();
        const projsData = await projsRes.json();
        const studsData = await studsRes.json();

        const orgs = orgsData.data || [];
        const projs = projsData.data || [];
        const studs = studsData.data || [];

        setOrganizaciones(orgs);
        setProjects(projs);
        setStudents(studs);
        
        localStorage.setItem("organizaciones", JSON.stringify(orgs));
        localStorage.setItem("proyectos", JSON.stringify(projs));
        localStorage.setItem("estudiantes", JSON.stringify(studs));
        
      } catch (err) {
        console.error("Error fetching data from API:", err);
        const orgs = JSON.parse(localStorage.getItem("organizaciones")) || [];
        const projs = JSON.parse(localStorage.getItem("proyectos")) || [];
        const studsRaw = JSON.parse(localStorage.getItem("estudiantes")) || [];
        const studs = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);
        setOrganizaciones(orgs);
        setProjects(projs);
        setStudents(studs);
      }
    };
    
    fetchData();
  }, []);

 

  // Obtener periodo del proyecto
  const getUniquePeriods = () => {
    const periods = new Set();
    
    students.forEach((s) => {
      // Handle new format (enrollments array)
      if (Array.isArray(s.enrollments) && s.enrollments.length > 0) {
        s.enrollments.forEach((enrollment) => {
          const project = projects.find(p => Number(p.id_proyecto || p.id) === Number(enrollment.id_proyecto || enrollment.project_id));
          const periodo = enrollment.periodo || project?.periodo || project?.period_id;
          if (periodo) {
            periods.add(periodo);
          }
        });
      }
      // Handle old format (single id_proyecto)
      else if (s.id_proyecto) {
        const project = projects.find(p => Number(p.id_proyecto || p.id) === Number(s.id_proyecto));
        if (project?.periodo || project?.period_id) {
          periods.add(project.periodo || project.period_id);
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
                <MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>
                  {org.nombre_osf || org.name}
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
                .filter((proj) => (selectedOrg ? Number(proj.id_organizacion || proj.org_id) === Number(selectedOrg) : true))
                .map((proj) => (
                  <MenuItem key={proj.id_proyecto || proj.id} value={proj.id_proyecto || proj.id}>
                    {proj.nombre_proyecto || proj.name}
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

        
          </Box>

          {/* STATS */}
          <AdminDashboardPanel
                  students={students}
                  projects={projects}
                  organizations={organizaciones}
                  selectedOrg={selectedOrg}
                  selectedProject={selectedProject}
                  selectedPeriod={selectedPeriod}
                />
            <Box></Box>

        </Container>
      </Box>
    </Box>
  )
};

export default MainPage;