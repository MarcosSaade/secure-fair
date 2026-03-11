import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const StudentEnroll = () => {
  const [formData, setFormData] = useState({
    codigo: "",
  });
  const [accepted, setAccepted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleContinue = () => {
    if (accepted) {
      navigate("/student/confirmation");
    } else {
      alert("Debes aceptar las políticas del servicio social antes de continuar.");
    }
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
            Ingresa tu código de registro
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            Asegúrate de ingresar el código que tu socio-formador te haya proporcionado.
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Código de registro"
              name="codigo"
              fullWidth
              value={formData.codigo}
              onChange={handleChange}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label="Acepto las políticas del servicio social"
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={!accepted}
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

export default StudentEnroll;
