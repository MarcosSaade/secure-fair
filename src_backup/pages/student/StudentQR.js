import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  useTheme,
  Container,
} from "@mui/material";
import { AccountCircle as AccountCircleIcon } from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../Logo.png";
import { getCheckedInStudentsToday } from "../../services/studentService";

const StudentQR = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isValidated, setIsValidated] = useState(false);
  const [isDenied, setIsDenied] = useState(false); // NEW: Track denied status
  const [timeRemaining, setTimeRemaining] = useState(""); // NEW: Show time until slot

  // Get student data from sessionStorage
  const studentData = JSON.parse(sessionStorage.getItem("studentData") || "{}");
  const username = sessionStorage.getItem("username") || "";

  // Generate QR value with student data
  const qrValue = JSON.stringify({
    username: username,
    matricula: studentData?.matricula || "",
    nombre: studentData?.nombre || "",
    hora_registro: studentData?.hora_registro || "",
    timestamp: new Date().toISOString(),
  });

  // Update current time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if time slot is valid and if student was checked in
  useEffect(() => {
    const checkStatus = async () => {
      // First check if already validated (checked in by admin)
      const checkedInStudents = await getCheckedInStudentsToday();
      const isCheckedIn = checkedInStudents.some(
        (student) => student.matricula === studentData?.matricula
      );

      if (isCheckedIn) {
        setIsValidated(true);
        setIsDenied(false);
        return;
      }

      // Check if time slot is valid
      const now = new Date();
      const [time, period] = (studentData?.hora_registro || "").split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      let registeredHours = hours;
      if (period === "PM" && hours !== 12) {
        registeredHours += 12;
      } else if (period === "AM" && hours === 12) {
        registeredHours = 0;
      }

      const registeredDate = new Date();
      registeredDate.setHours(registeredHours, minutes, 0, 0);

      if (now >= registeredDate) {
        // Time is valid but not yet checked in by admin
        setIsValidated(false);
        setIsDenied(false);
      } else {
        // Time is NOT valid yet
        setIsValidated(false);
        setIsDenied(true);

        // Calculate time remaining
        const diffMs = registeredDate - now;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;

        if (diffHours > 0) {
          setTimeRemaining(`${diffHours}h ${remainingMins}m`);
        } else {
          setTimeRemaining(`${remainingMins}m`);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [studentData?.matricula, studentData?.hora_registro]);

  const handleProfile = () => {
    navigate("/student/profile");
  };

  const handleBack = () => {
    navigate("/student/register");
  };

  // Get QR color based on status
  const getQRColor = () => {
    if (isValidated) return theme.palette.success.main; // Green
    if (isDenied) return theme.palette.error.main; // Red
    return theme.palette.primary.main; // Blue (waiting for admin)
  };

  // Get status message
  const getStatusMessage = () => {
    if (isValidated) return "Validado correctamente";
    if (isDenied) return `Aún no es tu turno (Falta ${timeRemaining})`;
    return " Esperando validación";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: theme.shape.borderRadius,
            p: { xs: 3, sm: 4 },
            backgroundColor: theme.palette.background.paper,
            minHeight: { xs: "auto", sm: "80vh" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              mb: 4,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: { xs: 35, sm: 45 },
              }}
            />

            <IconButton
              onClick={handleProfile}
              sx={{
                backgroundColor: `${theme.palette.secondary.main}30`,
                color: theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: `${theme.palette.secondary.main}50`,
                },
              }}
            >
              <AccountCircleIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
            </IconButton>
          </Box>

          {/* MAIN CONTENT */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Tu Código QR
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              Hora de registro: {studentData?.hora_registro}
            </Typography>

            {/* QR Code Container - Changes color based on status */}
            <Box
              sx={{
                backgroundColor: "white",
                p: { xs: 2, sm: 3 },
                borderRadius: theme.shape.borderRadius,
                boxShadow: `0 8px 32px ${getQRColor()}40`,
                border: `3px solid ${getQRColor()}`,
                mb: 3,
                transition: "all 0.3s ease",
              }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={220}
                fgColor={getQRColor()}
                bgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </Box>

            {/* Status Message - Below QR */}
            <Box
              sx={{
                display: "inline-block",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: `${getQRColor()}20`,
                border: `2px solid ${getQRColor()}`,
                mb: 4,
              }}
            >
              <Typography
                sx={{
                  color: getQRColor(),
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                }}
              >
                {getStatusMessage()}
              </Typography>
            </Box>

            {/* Current time (optional, subtle) */}
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
              }}
            >
              {currentTime.toLocaleTimeString("es-ES")}
            </Typography>
          </Box>

          {/* BUTTONS */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleBack}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                py: 1.25,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: theme.palette.background.default,
                },
              }}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/student/slots")}
              disabled={!isValidated}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.paper,
                py: 1.25,
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: isValidated ? theme.palette.secondary.dark : theme.palette.secondary.main,
                  transform: isValidated ? "translateY(-2px)" : "none",
                },
                "&:disabled": {
                  backgroundColor: theme.palette.divider,
                  color: theme.palette.text.disabled,
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentQR;