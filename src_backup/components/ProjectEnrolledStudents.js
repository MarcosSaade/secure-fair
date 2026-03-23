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
  Typography
} from "@mui/material";

const ProjectEnrolledStudents = ({ students, projects, selectedProject }) => {

  console.log("Students received:", students);

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
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Fecha Registro</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student) => {
              const project = projects.find(
                (proj) => proj.project_id === student.project_id
              );

              return (
                <TableRow key={student.matricula}>
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>{student.nombre}</TableCell>
                  <TableCell>{student.correo}</TableCell>
                  <TableCell>{student.celular || "N/A"}</TableCell>
                  <TableCell>{student.carrera || "N/A"}</TableCell>
                  <TableCell>{project ? project.name : "N/A"}</TableCell>
                  <TableCell>{student.registered_at}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProjectEnrolledStudents;