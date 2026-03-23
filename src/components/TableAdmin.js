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

const TableAdmin = ({ students, projects, selectedProject }) => {


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
                (proj) => proj.id_proyecto === student.id_proyecto
              );

              const nombreCompleto = `${student.nombre} ${student.apellidos || ""}`.trim();

              return (
                <TableRow key={student.id_usuario}>
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>{nombreCompleto}</TableCell>
                  <TableCell>{student.correo}</TableCell>
                  <TableCell>{student.celular || "N/A"}</TableCell>
                  <TableCell>{student.carrera || "N/A"}</TableCell>
               
                  <TableCell>{project ? project.nombre_proyecto : "N/A"}</TableCell>
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

export default TableAdmin;