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
  const status = "accepted"; // pending | accepted | denied

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
    navigate("/student/slots");
  };

  const handleGoHome = () => {
    navigate("/student/register");
  };

  const handleProfile = () => {
    navigate("/student/profile");
  };

  // Buttones: Continuar (si accepted), Regresar a Página de inicio (si denied)
  const renderButtons = () => {
    if (status === "accepted") {
      return (
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
      );
    }

    if (status === "denied") {
      return (
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
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2479bd 0%, #1e3a8a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: 380,
          height: "85vh",
          borderRadius: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f9fafb"
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            borderBottom: "1px solid #e5e7eb"
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40 }}
          />

          <IconButton
            onClick={handleProfile}
            sx={{
              backgroundColor: "#e0f2fe",
              "&:hover": { backgroundColor: "#bae6fd" }
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 34, color: "#0369a1" }} />
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
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: getColor(),
              letterSpacing: 1,
              mb: 1
            }}
          >
            {getTitle()}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {getDescription()}
          </Typography>

          <Box
            sx={{
              backgroundColor: "white",
              p: 3,
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
          >
            <QRCodeCanvas
              value="student-12345"
              size={200}
              fgColor={getColor()}
            />
          </Box>
        </Box>

        {/* BOTONES */}
        {renderButtons()}

      </Paper>
    </Box>
  );
};

export default StudentQR;