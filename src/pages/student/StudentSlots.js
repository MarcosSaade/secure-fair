import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, Button, useTheme } from "@mui/material";
//import { projects } from "../projects";
import { organizations } from "../organization";
import ProjectsTable from "../../components/ProjectsTable";

const StudentSlots = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = JSON.parse(localStorage.getItem("proyectos")) || [];
      setProjects(storedProjects);
    };

    loadProjects();

    window.addEventListener("projectsUpdated", loadProjects);
    return () => window.removeEventListener("projectsUpdated", loadProjects);
  }, []);

  // Navigate to EnrollForm
  const handleRegister = () => {
    navigate("/student/enrollform");
  };

  // Get org name by orgID
  const getOrgName = (id_organizacion) => {
    const org = organizations.find((o) => o.id_organizacion === id_organizacion);
    return org ? org.nombre_osf : "";
  };

  // Filter projects by name and organization
  const filteredProjects = projects.filter((project) => {
    const matchesName = project.nombre_proyecto.toLowerCase().includes(search.toLowerCase());
    const matchesOrg = orgFilter ? project.id_organizacion === Number(orgFilter) : true;
    return matchesName && matchesOrg;
  });

  return (
    <Box sx={{ px: { xs: 2, sm: 4 } }}>
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
        Aquí puedes ver todos los proyectos disponibles para registrarte. Usa el buscador para encontrar proyectos por nombre o filtra por organización.
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
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
          sx={{
            '& .MuiOutlinedInput-root': { fontSize: '1rem' },
          }}
        />
        <TextField
          fullWidth
          label="Filtrar por organización"
          select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { fontSize: '1rem' },
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.id_organizacion} value={org.id_organizacion}>
              {org.nombre_osf}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Projects Table/Cards */}
      <ProjectsTable 
        projects={filteredProjects} 
        getOrgName={getOrgName}
      />
    </Box>
  );
};

export default StudentSlots;