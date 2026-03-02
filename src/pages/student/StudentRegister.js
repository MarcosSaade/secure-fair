
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { projects } from '../projects';
//import { organizations } from "../organization";


import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";


const StudentRegister = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    matricula: "",
    carrera: "",
    correo: "",
    celular: "",
    hora: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const horasDisponibles = [
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
  ];

  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/student/qr");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 2, fontWeight: 600, color: "#2479bd" }}
          >
            Registro
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            Esta información será usada únicamente para realizar el pre-registro.
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre completo"
              name="nombre"
              fullWidth
              value={formData.nombre}
              onChange={handleChange}
            />

            <TextField
              label="Matrícula"
              name="matricula"
              fullWidth
              value={formData.matricula}
              onChange={handleChange}
            />

            <TextField
              label="Carrera"
              name="carrera"
              fullWidth
              value={formData.carrera}
              onChange={handleChange}
            />

            <TextField
              label="Correo alterno"
              name="correo"
              type="email"
              fullWidth
              value={formData.correo}
              onChange={handleChange}
            />

            <TextField
              label="Celular"
              name="celular"
              fullWidth
              value={formData.celular}
              onChange={handleChange}
            />

            <TextField
              select
              label="Hora de registro"
              name="hora"
              fullWidth
              value={formData.hora}
              onChange={handleChange}
            >
              {horasDisponibles.map((hora) => (
                <MenuItem key={hora} value={hora}>
                  {hora}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{
                mt: 2,
                backgroundColor: "#2479bd",
                "&:hover": {
                  backgroundColor: "#1b5f91",
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentRegister;