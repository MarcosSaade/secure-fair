import React, { useState } from "react";
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



const MainSocio = () => {

  const navigate = useNavigate();

  // -------------------------
  // Mock Data
  // -------------------------
  const organizaciones = [
    "Organización 1",
    "Organización 2",
    "Organización 3",
    "Organización 4"
  ];

  const projects = {
    "Organización 1": ["Proyecto A", "Proyecto B"],
    "Organización 2": ["Proyecto C", "Proyecto D"],
    "Organización 3": ["Proyecto E", "Proyecto F"],
    "Organización 4": ["Proyecto G", "Proyecto H"]
  };

  // -------------------------
  // States
  // -------------------------
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // -------------------------
  // Navigation
  // -------------------------
  const handleGenerateCode = () => navigate("/socio/generate-code");
  const handleProfile = () => navigate("/socio/profile");



  const handleExport = () => {
    console.log("Exporting data...");
  };

  const handleOrgChange = (e) => {
    setSelectedOrg(e.target.value);
    setSelectedProject("");
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard de Socio-Formador
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Utiliza los botones a continuación para observar a los estudiantes registrados, generar códigos QR para tus proyectos y editar tu perfil.
      </Typography>

      {/* ACTION BUTTONS */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleGenerateCode}>
          Generar Códigos QR
        </Button>

        <Button variant="contained" color="secondary" onClick={handleProfile}>
          Perfil Socio-Formador
        </Button>

        {/* CRUD */}
        <Button variant="outlined" onClick={handleExport}>
          Exportar Datos
        </Button>
      </Box>

      {/* FILTER SECTION */}
      <Paper sx={{ mt: 5, p: 3, borderRadius: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          Filtrar por organización y proyecto
        </Typography>

        <Grid container spacing={2}>

          {/* Organization Selector */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Organization"
              fullWidth
              value={selectedOrg}
              onChange={handleOrgChange}
            >
              {organizaciones.map((org) => (
                <MenuItem key={org} value={org}>
                  {org}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Project Selector */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Project"
              fullWidth
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={!selectedOrg}
            >
              {selectedOrg &&
                projects[selectedOrg].map((proj) => (
                  <MenuItem key={proj} value={proj}>
                    {proj}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

        </Grid>
      </Paper>

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
              <Typography color="text.secondary">
                Check-Ins
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">8</Typography>
              <Typography color="text.secondary">
                Proyectos
              </Typography>
            </Paper>
          </Grid>

        </Grid>
      </Box>
      {/* Show list of students based on selected organization and project (mocked for now) */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Estudiantes Registrados
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body1">
            {selectedOrg && selectedProject
              ? `Mostrando estudiantes para ${selectedProject} de ${selectedOrg}`
              : "Selecciona una organización y proyecto para ver los estudiantes registrados."}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default MainSocio;