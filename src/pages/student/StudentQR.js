import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { QRCodeCanvas } from "qrcode.react";


import logo from "../Logo.png";

const StudentQR = () => {
  const status = "pending"; // pending | accepted | denied

  const getColor = () => {
    if (status === "accepted") return "#15803d";
    if (status === "denied") return "#dc2626";
    return "#000000";
  };

  const getTitle = () => {
    if (status === "accepted") return "Código aceptado";
    if (status === "denied") return "Código denegado";
    return "QR";
  };

  const getDescription = () => {
    if (status === "denied")
      return "Aún no es tu turno de inscripción, espera a la hora establecida.";
    return "Por favor, escanea el QR con el Servicio Social.";
  };

  const navigate = useNavigate();

  const handleContinue = () => {
        navigate("/student/StudentRegisterStatus");
    };

   const handleGoHome = () => {
        navigate("/student/StudentRegister");
    };


  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#2479bd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
    <Paper
    elevation={6}
    sx={{
        width: 360,
        height: "85vh",
        borderRadius: 6,
        p: 3,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white"
    }}
      >
        {/* HEADER DENTRO DE LA TARJETA */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40 }}
          />

          {/* Icono perfil */}
          <IconButton>
            <AccountCircleIcon sx={{ fontSize: 36 }} />
          </IconButton>
        </Box>

        {/* CONTENIDO CENTRAL */}
        <Box
        sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
        }}
        >
        <Typography variant="h5" fontWeight="bold" mb={2}>
            {getTitle()}
        </Typography>

        <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4 }}
        >
            {getDescription()}
        </Typography>

        <QRCodeCanvas
            value="student-12345"
            size={220}
            fgColor={getColor()}
        />
        </Box>

        {/* BOTONES */}
        {status === "accepted" && (
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{
              backgroundColor: "#0d9488",
              borderRadius: 3
            }}
          >
            Continuar
          </Button>
        )}

        {status === "denied" && (
          <Button
            variant="contained"
            onClick={handleGoHome}
            sx={{
              backgroundColor: "#a855f7",
              borderRadius: 3
            }}
          >
            Regresar a Página de inicio
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default StudentQR;