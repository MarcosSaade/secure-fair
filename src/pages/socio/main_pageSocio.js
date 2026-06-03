import React, {  useState } from "react";
import {  useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,

  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";


import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { QRCodeSVG } from 'qrcode.react';

//import { students as studentsData } from "../students.js";
//import { projects as projectsData } from "../projects.js";
import { organizations as orgsData } from "../organization.js";
import { enrollmentCodes as initialCodes } from "../enrollmentCodes.js";
import * as storageService from '../../services/StorageService';
import SocioDashboardPanel from "../../components/dashboardSocio";

const MainSocio = () => {
  // -------------------------
  // Hooks
  // -------------------------
  
  const { orgId } = useParams();
  const [selectedProject, setSelectedProject] = useState("");
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState(() => {
  const saved = localStorage.getItem("enrollmentCodes");
  return saved ? JSON.parse(saved) : initialCodes || [];
  });
  const [copiedCode, setCopiedCode] = useState(null);

  // Get org from localStorage (populated from real DB), not from hardcoded dummy file
  const allOrgs = storageService.getOrganizaciones();
  const organization = allOrgs.find(
    (org) => String(org.id_organizacion || org.id) === String(orgId)
  );

  // -------------------------
  // Proyectos de la organización
  // -------------------------
  //const projects = projectsData?.filter(
   // (proj) => proj.id_organizacion === Number(orgId)
  //) || [];

  // -------------------------
  // Convertir students (objeto → array)
  // -------------------------
  const [studentsArray, setStudentsArray] = useState([]);

  // Proyectos
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiBase = `/api`;
        
        const [orgsRes, projsRes, studsRes] = await Promise.all([
          fetch(`${apiBase}/organizations`),
          fetch(`${apiBase}/projects`),
          fetch(`${apiBase}/students`)
        ]);

        const orgsData = await orgsRes.json();
        const projsData = await projsRes.json();
        const studsData = await studsRes.json();

        if (orgsData.success) localStorage.setItem("organizaciones", JSON.stringify(orgsData.data));
        if (projsData.success) localStorage.setItem("proyectos", JSON.stringify(projsData.data));
        if (studsData.success) localStorage.setItem("estudiantes", JSON.stringify(studsData.data));
      } catch (err) {
        console.error("Error syncing with API:", err);
      }

      const studsRaw = storageService.getEstudiantes() || [];
      const storedStudents = Array.isArray(studsRaw) ? studsRaw : Object.values(studsRaw);

      console.log("Loaded students from storage:", storedStudents);

      const storedProjects = storageService.getProyectos() || [];

      const orgProject = storedProjects.filter(
        (proj) => Number(proj.id_organizacion) === Number(orgId) || Number(proj.org_id) === Number(orgId)
      );
      setProjects(orgProject);

      const orgStudents = storedStudents.filter(student => {
        // Handle API enrollments array
        if (Array.isArray(student.enrollments) && student.enrollments.length > 0) {
          return student.enrollments.some(enrollment => 
            orgProject.some(proj => Number(proj.id_proyecto || proj.id) === Number(enrollment.id_proyecto || enrollment.project_id))
          );
        }
        // Handle old single project format
        return orgProject.some(proj => Number(proj.id_proyecto || proj.id) === Number(student.id_proyecto));
      });
      setStudentsArray(orgStudents);
    };
     


  //    const storedProjects = storageService.getProyectos() || [];
   //   console.log("Loaded projects from storage:", storedProjects);
  //    setProjects(storedProjects);
   // };

   // const loadProjects = () => {
   //   const storedProjects = storageService.getProyectos();
   //   const orgProjects = storedProjects.filter(
   //     (proj) => proj.id_organizacion === Number(orgId)
    //  );
   //   setProjects(orgProjects);
    //};
    

    //loadStudents();
    //loadProjects();
    loadData();

    const handleUpdate = () => {
      console.log("EVENT 'studentUpdated' recibido en MainSocio");
      //loadStudents();
      //loadProjects();
      loadData();
    };

    window.addEventListener("projectsUpdated", handleUpdate);
    window.addEventListener("studentUpdated", handleUpdate);

    return () => {
      window.removeEventListener("projectsUpdated", handleUpdate);
      window.removeEventListener("studentUpdated", handleUpdate);
    };
  }, [orgId]);

  // -------------------------
  // IDs de proyectos de la org
  // -------------------------



  // -------------------------
  // Estudiantes inscritos en proyectos de la org
  // -------------------------
 // const studentsFromOrgProjects = studentsArray.filter((student) =>
   // projectIds.includes(Number(student.id_proyecto))
  //);

 // console.log("IDs de proyectos de la org:", projectIds);
  //console.log('Estudiantes inscritos en proyectos de la org:', studentsFromOrgProjects);

  // -------------------------
  // Filtrar por proyecto seleccionado
  // -------------------------
  
  // -------------------------
  // Get codes for selected project
  // -------------------------
  const projectCodes = selectedProject
    ? generatedCodes.filter((code) => code.id_proyecto === Number(selectedProject))
    : [];

  // -------------------------
  // Protección básica
  // -------------------------
  if (!organization) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Organización no válida</Typography>
      </Box>
    );
  }

  // -------------------------
  // Generate Code Function — saves to DB
  // -------------------------
  const generateEnrollmentCode = async () => {
    if (!selectedProject) {
      alert("Selecciona un proyecto primero para generar códigos de inscripción.");
      return;
    }

    try {
      const apiBase = `/api`;
      const user = JSON.parse(sessionStorage.getItem('user'));
      const issued_by = user?.id_usuario || user?.id || 1;

      const res = await fetch(`${apiBase}/codes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: Number(selectedProject),
          issued_by,
          expires_in_hours: 1
        })
      });
      const result = await res.json();

      if (result.success) {
        const newCode = {
          ...result.data,
          code_id: result.data.id,
          id_proyecto: Number(selectedProject),
          id_organizacion: Number(orgId),
          is_used: false,
        };
        const updatedCodes = [...generatedCodes, newCode];
        setGeneratedCodes(updatedCodes);
        // Keep local cache in sync
        localStorage.setItem("enrollmentCodes", JSON.stringify(updatedCodes));
      } else {
        alert(`Error al generar código: ${result.message}`);
      }
    } catch (err) {
      console.error('Error generating code:', err);
      alert('Error de conexión al generar el código. Verifica el backend.');
    }
  };

  // -------------------------
  // Copy Code to Clipboard
  // -------------------------
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // -------------------------
  // Navigation
  // -------------------------
 
 

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* HEADER SUPERIOR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard de {organization.nombre_osf}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus proyectos y visualiza los estudiantes registrados.
            Selecciona el proyecto que el estudiante desea y haz click en "Generar Nuevo Código."
          </Typography>
        </Box>

   
      </Box>

      {/* FILTER SECTION - AT TOP */}
  
        <Typography variant="h6" gutterBottom>
          Selecciona un proyecto para generar códigos de inscripción
        </Typography>

        <TextField
          select
          label="Proyecto"
          fullWidth
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              height: 60,
            },
          }}
        >
          <MenuItem value="">Todos los proyectos</MenuItem>
          {projects.map((proj) => (
            <MenuItem key={proj.id_proyecto} value={proj.id_proyecto}>
              {proj.nombre_proyecto}
            </MenuItem>
          ))}
        </TextField>
      

      {/* GENERATE CODE SECTION */}
      {selectedProject && (
        <Paper sx={{ p: 6, borderRadius: 3, mb: 4, backgroundColor: "#e0f7fa" }} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Códigos de Inscripción para {projects.find((p) => p.id_proyecto === Number(selectedProject))?.nombre_proyecto}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={generateEnrollmentCode}
              sx={{
                backgroundColor: "#0369a1",
                "&:hover": { backgroundColor: "#0284c7" },
              }}
            >
              Generar Nuevo Código
            </Button>

            <Button
              variant="outlined"
              onClick={() => setOpenCodeDialog(true)}
              disabled={projectCodes.length === 0}
            >
              Ver Códigos Generados ({projectCodes.length})
            </Button>
          </Box>

          {/* Quick Display of Latest Code */}
          {projectCodes.length > 0 && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: "#fff", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Último código generado:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    letterSpacing: 2,
                    color: "#0369a1",
                  }}
                >
                  {projectCodes[projectCodes.length - 1].code}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleCopyCode(projectCodes[projectCodes.length - 1].code)
                  }
                  sx={{
                    color:
                      copiedCode === projectCodes[projectCodes.length - 1].code
                        ? "#22c55e"
                        : "#666",
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
                {copiedCode === projectCodes[projectCodes.length - 1].code && (
                  <Typography variant="body2" sx={{ color: "#22c55e" }}>
                    ¡Copiado!
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG value={projectCodes[projectCodes.length - 1].code} size={200} />
                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                  Pide al estudiante que escanee este código
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* ESTADÍSTICAS */}
      <SocioDashboardPanel
          projects={projects}
          students={studentsArray}
          selectedProject={selectedProject}
        />

      {/* CODES DIALOG */}
      <Dialog open={openCodeDialog} onClose={() => setOpenCodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Códigos de Inscripción Generados</DialogTitle>
        <DialogContent sx={{ maxHeight: "500px", overflowY: "auto" }}>
          {projectCodes.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {projectCodes.map((codeObj) => (
                <CodeCard
                  key={codeObj.code_id}
                  codeObj={codeObj}
                  onCopy={handleCopyCode}
                  isCopied={copiedCode === codeObj.code}
                />
              ))}
            </Box>
          ) : (
            <Typography>No hay códigos generados para este proyecto.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCodeDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// -------------------------
// Code Card Component
// -------------------------
const CodeCard = ({ codeObj, onCopy, isCopied }) => {
  const [timeLeft, setTimeLeft] = React.useState("");
  const [showQR, setShowQR] = React.useState(false);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const expiresAt = new Date(codeObj.expires_at).getTime();
        const now = new Date().getTime();
        const difference = expiresAt - now;

        if (difference > 0) {
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Expirado");
        }
      } catch (error) {
        setTimeLeft("Error");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [codeObj.expires_at]);

  const isExpired = new Date(codeObj.expires_at).getTime() < new Date().getTime();

  return (
    <Paper
      sx={{
        p: 2,
        borderLeft: `4px solid ${codeObj.is_used ? "#f87171" : "#0369a1"}`,
        backgroundColor: codeObj.is_used ? "#fef2f2" : "#f0f9ff",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Código: <strong style={{ fontFamily: "monospace" }}>{codeObj.code}</strong>
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={() => setShowQR(!showQR)}
            sx={{ color: showQR ? "#0369a1" : "#666", mr: 1 }}
            disabled={codeObj.is_used || isExpired}
          >
            <QrCodeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onCopy(codeObj.code)}
            sx={{ color: isCopied ? "#22c55e" : "#666" }}
            disabled={codeObj.is_used || isExpired}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        {codeObj.is_used ? (
          <Chip label="Utilizado" size="small" color="error" variant="outlined" />
        ) : isExpired ? (
          <Chip label="Expirado" size="small" color="warning" variant="outlined" />
        ) : (
          <Chip
            label={`Expira en: ${timeLeft}`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Box>

      {codeObj.is_used && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: "#dc2626" }}>
          Utilizado por: {codeObj.used_by} en {new Date(codeObj.used_at).toLocaleString()}
        </Typography>
      )}

      {showQR && !codeObj.is_used && !isExpired && (
        <Box sx={{ mt: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', borderRadius: 2 }}>
          <QRCodeSVG value={codeObj.code} size={200} />
          <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
            Pide al estudiante que escanee este código
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MainSocio;
