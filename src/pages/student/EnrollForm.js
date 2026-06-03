import React, { useState, useRef, useEffect } from "react";
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
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import jsQR from "jsqr";

import * as storageService from '../../services/StorageService';

const StudentEnroll = () => {
  const [formData, setFormData] = useState({ codigo: "" });
  const [accepted, setAccepted] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // -------------------------
  // Camera Functions
  // -------------------------
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Tu dispositivo no soporta el acceso a la cámara o necesitas usar https://");
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch (errFallback) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          setCameraActive(true);
          scanQR();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert(`No se pudo abrir la cámara: ${err.message || "Permiso denegado"}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const scanQR = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      requestAnimationFrame(scanQR);
      return;
    }

    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(scanQR);
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data) {
        stopCamera();
        setFormData(prev => ({ ...prev, codigo: code.data }));
        setValidationResult(null);
        return;
      }
    } catch (err) {
      console.log("Safe scan error:", err);
    }

    requestAnimationFrame(scanQR);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationResult) setValidationResult(null);
  };

  // -------------------------
  // Validate Code via API (source of truth)
  // -------------------------
  const validateCode = async () => {
    if (!formData.codigo.trim()) {
      setValidationResult({ success: false, message: "Ingresa un código válido" });
      return;
    }

    setValidating(true);

    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const studentData = JSON.parse(sessionStorage.getItem("studentData") || "{}");

      if (!user) {
        setValidationResult({ success: false, message: "No se pudo identificar al estudiante. Inicia sesión nuevamente." });
        setValidating(false);
        return;
      }

      const student_user_id = user?.id_usuario || user?.id;
      const apiBase = `/api`;

      // Validate code against the DATABASE (not localStorage)
      const validateRes = await fetch(`${apiBase}/codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.codigo.toUpperCase(),
          student_user_id: student_user_id
        })
      });
      const validateResult = await validateRes.json();

      if (!validateResult.success) {
        setValidationResult({ success: false, message: validateResult.message });
        setValidating(false);
        return;
      }

      // Code is valid — project comes from API response
      const project = validateResult.data?.project;
      if (!project) {
        setValidationResult({ success: false, message: "El proyecto asociado al código no existe." });
        setValidating(false);
        return;
      }

      // Normalize project fields for legacy compatibility
      const projectNormalized = {
        ...project,
        id_proyecto: project.id_proyecto || project.id,
        nombre_proyecto: project.nombre_proyecto || project.name,
        id_organizacion: project.id_organizacion || project.org_id,
      };

      // Check if student already enrolled in this period (via DB enrollments)
      const studentRes = await fetch(`${apiBase}/students/${student_user_id}`);
      const studentResult = await studentRes.json();

      if (studentResult.success) {
        const dbEnrollments = studentResult.data?.enrollments || [];
        const projectId = projectNormalized.id_proyecto;
        const alreadyEnrolled = dbEnrollments.some(e =>
          Number(e.project_id || e.id_proyecto) === Number(projectId)
        );
        if (alreadyEnrolled) {
          setValidationResult({
            success: false,
            message: `Ya estás inscrito en este proyecto.`,
          });
          setValidating(false);
          return;
        }
      }

      // === SAVE ENROLLMENT TO DATABASE ===
      const enrollRes = await fetch(`${apiBase}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_user_id: student_user_id,
          project_id: projectNormalized.id_proyecto,
        })
      });
      const enrollResult = await enrollRes.json();

      if (!enrollResult.success) {
        // Already enrolled check (unique constraint)
        if (enrollResult.message?.includes('ya está inscrito') || enrollResult.message?.includes('unique')) {
          setValidationResult({
            success: false,
            message: "Ya estás inscrito en un proyecto en este periodo.",
          });
        } else {
          setValidationResult({
            success: false,
            message: `Error al inscribirse: ${enrollResult.message}`,
          });
        }
        setValidating(false);
        return;
      }

      console.log('✅ Enrollment saved to DB:', enrollResult.data);

      // Update local session cache with new enrollment
      const newEnrollment = {
        id_proyecto: projectNormalized.id_proyecto,
        project_id: projectNormalized.id_proyecto,
        id_organizacion: projectNormalized.id_organizacion,
      };

      const currentEnrollments = Array.isArray(studentData?.enrollments) ? studentData.enrollments : [];
      const updatedStudent = {
        ...studentData,
        id_usuario: student_user_id,
        enrollments: [...currentEnrollments, newEnrollment],
      };

      storageService.saveEstudiante(updatedStudent);
      sessionStorage.setItem("studentData", JSON.stringify(updatedStudent));
      window.dispatchEvent(new Event('studentUpdated'));

      // Also update project slot count locally
      try {
        const proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];
        const proyectoIndex = proyectos.findIndex(p =>
          Number(p.id_proyecto || p.id) === Number(projectNormalized.id_proyecto)
        );
        if (proyectoIndex >= 0) {
          proyectos[proyectoIndex].inscritos = (proyectos[proyectoIndex].inscritos || 0) + 1;
          localStorage.setItem("proyectos", JSON.stringify(proyectos));
          window.dispatchEvent(new Event("projectsUpdated"));
        }
      } catch (e) { /* non-critical */ }

      setProjectInfo(projectNormalized);
      setValidationResult({
        success: true,
        message: `¡Inscripción exitosa! Te has inscrito al proyecto: ${projectNormalized.nombre_proyecto}`,
      });

    } catch (err) {
      console.error('Error validating code:', err);
      setValidationResult({
        success: false,
        message: "Error de conexión. Verifica que el backend esté corriendo.",
      });
    }

    setValidating(false);
  };

  const handleContinue = () => {
    if (!accepted) {
      alert("Debes aceptar las políticas del servicio social antes de continuar.");
      return;
    }
    if (!validationResult || !validationResult.success) {
      alert("Valida tu código primero.");
      return;
    }
    if (!projectInfo) {
      alert("No se encontró la información del proyecto. Valida el código nuevamente.");
      return;
    }

    navigate("/student/confirmation", {
      state: { projectInfo, enrollmentCode: formData.codigo },
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 2, fontWeight: 600, color: "#2479bd" }}
          >
            Ingresa tu código de registro
          </Typography>

          <Typography variant="body2" align="center" sx={{ mb: 4, color: "text.secondary" }}>
            Asegúrate de ingresar el código que tu socio-formador te haya proporcionado.
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* Video Camera Container - always in DOM so ref works */}
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', mb: 2, display: cameraActive ? 'block' : 'none' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto', display: 'block' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '3px dashed rgba(255,255,255,0.5)', borderRadius: 2 }} />
              <Button
                variant="contained"
                color="error"
                onClick={stopCamera}
                sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
              >
                Cancelar Escaneo
              </Button>
            </Box>

            {!cameraActive && (
              <Button
                variant="outlined"
                startIcon={<QrCodeScannerIcon />}
                onClick={startCamera}
                sx={{ py: 1.5, borderColor: "#2479bd", color: "#2479bd", "&:hover": { borderColor: "#1b5f91", backgroundColor: "#f0f9ff" } }}
                disabled={validating || validationResult?.success}
              >
                Escanear Código QR
              </Button>
            )}

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
                disabled={validating || !formData.codigo.trim() || validationResult?.success}
                sx={{
                  backgroundColor: "#2479bd",
                  "&:hover": { backgroundColor: "#1b5f91" },
                  minWidth: 120,
                }}
              >
                {validating ? <CircularProgress size={24} /> : "Validar"}
              </Button>
            </Box>

            {validationResult && (
              <Alert
                icon={validationResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                severity={validationResult.success ? "success" : "error"}
              >
                {validationResult.message}
              </Alert>
            )}

            {projectInfo && (
              <Paper sx={{ p: 2, backgroundColor: "#f0f9ff", borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {projectInfo.nombre_proyecto}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {projectInfo.descripcion || projectInfo.description || "Sin descripción"}
                </Typography>
              </Paper>
            )}

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

            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={!accepted || !validationResult?.success}
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#2479bd",
                "&:hover": { backgroundColor: "#1b5f91" },
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
