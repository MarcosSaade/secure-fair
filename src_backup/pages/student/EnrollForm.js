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
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import { projects as projectsData } from "../projects.js";

const StudentEnroll = () => {
  const [formData, setFormData] = useState({
    codigo: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (validationResult) {
      setValidationResult(null);
    }
  };

  // -------------------------
  // Validate Code (UPDATED)
  // -------------------------
  const validateCode = () => {
    if (!formData.codigo.trim()) {
      setValidationResult({
        success: false,
        message: "Ingresa un código válido",
      });
      return;
    }

    setValidating(true);

    setTimeout(() => {
      //  READ FROM LOCALSTORAGE INSTEAD OF STATIC FILE
      const savedCodes =
        JSON.parse(localStorage.getItem("enrollmentCodes")) || [];

      const codeObj = savedCodes.find(
        (code) => code.code === formData.codigo.toUpperCase()
      );

      if (!codeObj) {
        setValidationResult({
          success: false,
          message: "El código ingresado no es válido o no existe.",
        });
        setValidating(false);
        return;
      }

      // Check expiration
      const expiresAt = new Date(codeObj.expires_at).getTime();
      const now = new Date().getTime();

      if (expiresAt < now) {
        setValidationResult({
          success: false,
          message:
            "El código ha expirado. Solicita uno nuevo a tu socio-formador.",
        });
        setValidating(false);
        return;
      }

      // Check if already used
      if (codeObj.is_used) {
        setValidationResult({
          success: false,
          message: "Este código ya ha sido utilizado.",
        });
        setValidating(false);
        return;
      }
      //  MARK CODE AS USED
      const username = sessionStorage.getItem("username");
      const studentData = JSON.parse(sessionStorage.getItem("studentData"));

      if (studentData?.project_id) {
          setValidationResult({
            success: false,
            message: "Ya estás inscrito en un proyecto. No puedes inscribirte en más de uno.",
          });
          setValidating(false);
          return;
        }


      if (!studentData || !username) {
        setValidationResult({
          success: false,
          message: "No se pudo identificar al estudiante. Inicia sesión nuevamente.",
        });
        setValidating(false);
        return;
      }

      const alreadyUsed = savedCodes.some(
        (code) => code.used_by === studentData.matricula
      );

      if (alreadyUsed) {
        setValidationResult({
          success: false,
          message: "Ya has utilizado un código anteriormente.",
        });
        setValidating(false);
        return;
      }

      codeObj.is_used = true;
      codeObj.used_at = new Date().toISOString();
      codeObj.used_by = studentData.matricula;


      localStorage.setItem("enrollmentCodes",JSON.stringify(savedCodes));

      const studentAccounts = JSON.parse(localStorage.getItem("studentAccounts")) || {};

      if (studentAccounts[username]) {
        studentAccounts[username].project_id = codeObj.project_id;
        studentAccounts[username].orgID = codeObj.socio_id;

        localStorage.setItem(
          "studentAccounts",
          JSON.stringify(studentAccounts)
        );

        //  ALSO UPDATE SESSION STORAGE
        sessionStorage.setItem(
          "studentData",
          JSON.stringify(studentAccounts[username])
        );
      }

      const project = projectsData.find(
        (p) => p.project_id === codeObj.project_id
      );

      setProjectInfo(project);

      setValidationResult({
        success: true,
        message: `¡Código válido! Te has inscrito al proyecto: ${project.name}`,
      });

      setValidating(false);
    }, 1500);
  };

  const handleContinue = () => {
    if (!accepted) {
      alert(
        "Debes aceptar las políticas del servicio social antes de continuar."
      );
      return;
    }

    if (!validationResult || !validationResult.success) {
      alert("Valida tu código primero.");
      return;
    }

    navigate("/student/confirmation", {
      state: { projectInfo, enrollmentCode: formData.codigo },
    });
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

          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Code Input */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Código de registro"
                name="codigo"
                fullWidth
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ABC123DEF456"
                disabled={validating || validationResult?.success}
                inputProps={{ style: { textTransform: "uppercase" } }}
              />
              <Button
                variant="contained"
                onClick={validateCode}
                disabled={
                  validating ||
                  !formData.codigo.trim() ||
                  validationResult?.success
                }
                sx={{
                  backgroundColor: "#2479bd",
                  "&:hover": { backgroundColor: "#1b5f91" },
                  minWidth: 120,
                }}
              >
                {validating ? <CircularProgress size={24} /> : "Validar"}
              </Button>
            </Box>

            {/* Validation Result */}
            {validationResult && (
              <Alert
                icon={
                  validationResult.success ? (
                    <CheckCircleIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
                severity={validationResult.success ? "success" : "error"}
              >
                {validationResult.message}
              </Alert>
            )}

            {/* Project Info */}
            {projectInfo && (
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#f0f9ff",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {projectInfo.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                >
                  {projectInfo.description}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Duración
                    </Typography>
                    <Typography variant="body2">
                      {projectInfo.duration}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Horas Acreditadas
                    </Typography>
                    <Typography variant="body2">
                      {projectInfo.horas_acreditadas} horas
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Terms */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  color="primary"
                  disabled={!validationResult?.success}
                />
              }
              label="Acepto las políticas del servicio social"
            />

            {/* Continue */}
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={!accepted || !validationResult?.success}
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