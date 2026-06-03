import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";

const TableAdmin = ({ students, projects, organizations, selectedProject }) => {
  if (!students || students.length === 0) {
    return (
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography>
            No hay estudiantes registrados {selectedProject ? "en este proyecto" : "en esta organización"}.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f9ff" }}>
              <TableCell><strong>Matrícula</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Correo</strong></TableCell>
              <TableCell><strong>Celular</strong></TableCell>
              <TableCell><strong>Carrera</strong></TableCell>
              <TableCell><strong>Organización</strong></TableCell>
              <TableCell><strong>Proyectos Inscritos</strong></TableCell>
              <TableCell><strong>Período</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.filter((student) => student && student.nombre && student.matricula).map((student) => {
              const nombreCompleto = `${student.nombre} ${student.apellidos || ""}`.trim();

              // ============================================
              // NEW: Get all enrolled projects from enrollments array
              // ============================================
              const enrolledProjects = Array.isArray(student.enrollments)
                ? student.enrollments
                    .map((enrollment) => {
                      const proj = enrollment.project || projects.find(
                        (p) => p.id_proyecto === enrollment.id_proyecto || p.id === enrollment.project_id
                      );
                      if (!proj && !enrollment.id_proyecto) return null;
                      return {
                        ...(proj || {}),
                        id_proyecto: enrollment.id_proyecto || proj?.id_proyecto || proj?.id,
                        nombre_proyecto: enrollment.nombre_proyecto || proj?.nombre_proyecto || proj?.name,
                        // Use the periodo string directly from enrollment (populated by API from fair_period.name)
                        periodo: enrollment.periodo || proj?.periodo || null,
                        id_organizacion: enrollment.id_organizacion || proj?.org_id || proj?.id_organizacion,
                        nombre_osf: enrollment.nombre_osf || null,
                      };
                    })
                    .filter((p) => p)
                : [];

              // Backward compatibility: if no enrollments array, use old single project
              let projectsToDisplay = enrolledProjects;
              if (enrolledProjects.length === 0 && (student.id_proyecto || student.project_id)) {
                const pId = student.id_proyecto || student.project_id;
                const singleProject = projects.find(
                  (proj) => proj.id_proyecto === pId || proj.id === pId
                );
                if (singleProject) {
                  projectsToDisplay = [
                    {
                      ...singleProject,
                      id_proyecto: singleProject.id_proyecto || singleProject.id,
                      nombre_proyecto: singleProject.nombre_proyecto || singleProject.name,
                      id_organizacion: student.id_organizacion || singleProject.org_id || singleProject.id_organizacion,
                      periodo: student.periodo || singleProject.period_id || 2
                    },
                  ];
                }
              }

              // Get all unique organizations from all enrollments
              const organizationsForStudent = projectsToDisplay
                .map((p) =>
                  organizations.find((org) => org.id_organizacion === p.id_organizacion || org.id === p.id_organizacion)
                )
                .filter((org, index, self) =>
                  org && self.findIndex((o) => (o?.id_organizacion || o?.id) === (org.id_organizacion || org.id)) === index
                ); // Remove duplicates

              const organizationNames = organizationsForStudent
                .map((org) => org?.nombre_osf || org?.name)
                .filter(Boolean)
                .join(", ");

              return (
                <TableRow key={student.id_usuario}>
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>{nombreCompleto}</TableCell>
                  <TableCell>{student.correo}</TableCell>
                  <TableCell>{student.celular || "N/A"}</TableCell>
                  <TableCell>{student.carrera || "N/A"}</TableCell>
                  <TableCell>
                    {organizationNames || "NO INSCRITO"}
                  </TableCell>
                  <TableCell>
                    {projectsToDisplay.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {projectsToDisplay.map((project, idx) => (
                          <Chip
                            key={`${project.id_proyecto}-${idx}`}
                            label={project.nombre_proyecto || 'Proyecto'}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    ) : (
                      "NO INSCRITO"
                    )}
                  </TableCell>
                  <TableCell>
                    {projectsToDisplay.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {projectsToDisplay.map((project, idx) => (
                          <Chip
                            key={`per-${project.id_proyecto}-${idx}`}
                            label={project.periodo || "—"}
                            size="small"
                            color={project.periodo === 'Verano' ? 'warning' : project.periodo === 'Invierno' ? 'info' : project.periodo === 'Ago-Dic' ? 'success' : 'secondary'}
                          />
                        ))}
                      </Box>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TableAdmin;