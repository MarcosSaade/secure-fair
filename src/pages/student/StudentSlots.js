import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, Button, useTheme, CircularProgress } from "@mui/material";
//import { projects } from "../projects";
//import { organizations } from "../organization";
import ProjectsTable from "../../components/ProjectsTable";

const StudentSlots = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const PERIODOS = ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];
  const API_BASE = `/api`;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [projsRes, orgsRes] = await Promise.all([
          fetch(`${API_BASE}/projects`),
          fetch(`${API_BASE}/organizations`),
        ]);
        const projsData = await projsRes.json();
        const orgsData = await orgsRes.json();

        if (projsData.success) {
          // Normalize field names from API
          const normalized = projsData.data.map(p => ({
            ...p,
            id_proyecto: p.id_proyecto || p.id,
            nombre_proyecto: p.nombre_proyecto || p.name,
            descripcion_proyecto: p.descripcion_proyecto || p.description,
            id_organizacion: p.id_organizacion || p.org_id,
            cupo_estudiantes: p.cupo_estudiantes || p.capacity,
            duracion: p.duracion || p.duration,
            lugar: p.lugar || p.location,
            horas_acreditadas: p.horas_acreditadas ?? p.accredited_hours,
            periodo: p.periodo || null,
          }));
          setProjects(normalized);
          localStorage.setItem('proyectos', JSON.stringify(normalized));
        }
        if (orgsData.success) {
          setOrganizations(orgsData.data);
          localStorage.setItem('organizaciones', JSON.stringify(orgsData.data));
        }
      } catch (_) {
        // Fallback to localStorage
        setProjects(JSON.parse(localStorage.getItem('proyectos')) || []);
        setOrganizations(JSON.parse(localStorage.getItem('organizaciones')) || []);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Navigate to EnrollForm
  const handleRegister = () => navigate("/student/enrollform");

  // Filter projects by name, organization, and period
  const filteredProjects = projects.filter((project) => {
    const matchesName = (project.nombre_proyecto || '').toLowerCase().includes(search.toLowerCase());
    const matchesOrg = orgFilter ? Number(project.id_organizacion) === Number(orgFilter) : true;
    const matchesPeriod = periodFilter ? project.periodo === periodFilter : true;
    return matchesName && matchesOrg && matchesPeriod;
  });

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, width: '100%' }}>
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '2rem' },
        }}
      >
        Elige tu Servicio Social
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          mb: 3,
          fontSize: { xs: '0.9rem', sm: '1rem' },
        }}
      >
        Aquí puedes ver todos los proyectos disponibles para registrarte. Usa el buscador para encontrar proyectos por nombre o filtra por organización y periodo.
        Una vez que encuentres un proyecto que te interese, haz clic en "Registrarse" y después ingresa el código que te proporcione el Socio-Formador.
      </Typography>

      {/* Register Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleRegister}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.paper,
            fontWeight: 600,
            fontSize: '1rem',
            py: 1.5,
            '&:hover': { backgroundColor: theme.palette.secondary.dark },
          }}
        >
          Registrarse
        </Button>
      </Box>

      {/* Search Filters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          fullWidth
          label="Buscar por nombre"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          fullWidth
          label="Filtrar por organización"
          select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <MenuItem value="">Todas</MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.id_organizacion || org.id} value={org.id_organizacion || org.id}>
              {org.nombre_osf || org.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Filtrar por periodo"
          select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
        >
          <MenuItem value="">Todos los periodos</MenuItem>
          {PERIODOS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
      </Box>

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProjectsTable
          projects={filteredProjects}
          organizations={organizations}
        />
      )}
    </Box>
  );
};

export default StudentSlots;