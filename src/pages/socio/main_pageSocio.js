import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { students as studentsData } from "../students.js";
import { projects as projectsData } from "../projects.js";
import { organizations as orgsData } from "../organization.js";

const MainSocio = () => {

  // -------------------------
  // Hooks
  // -------------------------
  const navigate = useNavigate();
  const { orgId } = useParams();
  const [selectedProject, setSelectedProject] = useState("");

  // -------------------------
  // Obtener organización
  // -------------------------
  const organization = orgsData.find(
    (org) => org.orgID === Number(orgId)
  );

  // -------------------------
  // Proyectos de la organización
  // -------------------------
  const projects = projectsData.filter(
    (proj) => proj.orgID === Number(orgId)
  );

  // -------------------------
  // Convertir students (objeto → array)
  // -------------------------
  const studentsArray = Object.values(studentsData);

  // -------------------------
  // IDs de proyectos de la org
  // -------------------------
  const projectIds = projects.map((proj) => proj.project_id);

  // -------------------------
  // Estudiantes inscritos en proyectos de la org
  // -------------------------
  const studentsFromOrgProjects = studentsArray.filter((student) =>
    projectIds.includes(student.project_id)
  );

  // -------------------------
  // Filtrar por proyecto seleccionado
  // -------------------------
  const filteredStudents = selectedProject
    ? studentsFromOrgProjects.filter(
        (student) => student.project_id === Number(selectedProject)
      )
    : studentsFromOrgProjects;

  // -------------------------
  // Protección básica
  // -------------------------
  if (!organization) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">
          Organización no válida
        </Typography>
      </Box>
    );
  }

  // -------------------------
  // Navigation
  // -------------------------
  const handleGenerateCode = () => navigate("/socio/generate-code");
  const handleProfile = () => navigate("/socio/profile");

  const handleExport = (type = "csv") => {

    // Convertimos los datos al formato exportable
    const dataToExport = filteredStudents.map((student) => {
      const project = projects.find(
        (proj) => proj.project_id === student.project_id
      );

      return {
        Matricula: student.matricula,
        Nombre: student.nombre,
        Correo: student.correo,
        Telefono: student.telefono,
        Proyecto: project ? project.name : "N/A",
        Fecha_Registro: student.registered_at
      };
    });

    if (type === "csv") {
      // ---------- CSV ----------
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "estudiantes.csv");

    } else if (type === "xlsx") {
      // ---------- XLSX ----------
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
      });

      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      saveAs(blob, "estudiantes.xlsx");
    }
  };
  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>

      {/* HEADER SUPERIOR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard de {organization.name_org}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Gestiona tus proyectos y visualiza los estudiantes registrados.
          </Typography>
        </Box>

        <IconButton
          onClick={handleProfile}
          sx={{
            backgroundColor: "#e0f2fe",
            "&:hover": { backgroundColor: "#bae6fd" }
          }}
        >
          <AccountCircleIcon
            sx={{ fontSize: 34, color: "#0369a1" }}
          />
        </IconButton>
      </Box>

      {/* ACTION BUTTONS */}
      <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleGenerateCode}>
          Generar Códigos QR
        </Button>

        <Button variant="outlined" onClick={() => handleExport("csv")}>
          Exportar CSV
        </Button>
        <Button variant="outlined" onClick={() => handleExport("xlsx")}>
          Exportar XLSX
        </Button>
      </Box>

      {/* FILTER SECTION */}
      <Paper sx={{ mt: 5, p: 3, borderRadius: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          Proyecto
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Proyecto"
              fullWidth
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60
                }
              }}
            >
              <MenuItem value="">
                Todos los proyectos
              </MenuItem>

              {projects.map((proj) => (
                <MenuItem key={proj.project_id} value={proj.project_id}>
                  {proj.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* ESTADÍSTICAS */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Estadísticas
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">
                {studentsFromOrgProjects.length}
              </Typography>
              <Typography color="text.secondary">
                Total Estudiantes
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">
                {filteredStudents.length}
              </Typography>
              <Typography color="text.secondary">
                Estudiantes Filtrados
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h5">
                {projects.length}
              </Typography>
              <Typography color="text.secondary">
                Proyectos Activos
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* TABLA DE ESTUDIANTES */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Estudiantes Registrados
        </Typography>

        <Paper sx={{ borderRadius: 3 }}>
          {filteredStudents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Matrícula</strong></TableCell>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Correo</strong></TableCell>
                    <TableCell><strong>Teléfono</strong></TableCell>
                    <TableCell><strong>Proyecto</strong></TableCell>
                    <TableCell><strong>Fecha Registro</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredStudents.map((student) => {
                    const project = projects.find(
                      (proj) => proj.project_id === student.project_id
                    );

                    return (
                      <TableRow key={student.matricula}>
                        <TableCell>{student.matricula}</TableCell>
                        <TableCell>{student.nombre}</TableCell>
                        <TableCell>{student.correo}</TableCell>
                        <TableCell>{student.telefono}</TableCell>
                        <TableCell>
                          {project ? project.name : "N/A"}
                        </TableCell>
                        <TableCell>{student.registered_at}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography>
                No hay estudiantes registrados en esta organización.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

    </Box>
  );
};

export default MainSocio;