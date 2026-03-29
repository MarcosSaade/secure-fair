import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Paper, Typography, Button } from "@mui/material";
import { projects } from "../projects";
import { organizations } from "../organization";

const StudentEnrollConfirm = () => {
  const navigate = useNavigate();

  // Obtener username y datos del estudiante desde sessionStorage
  const studentData = JSON.parse(sessionStorage.getItem("studentData") || "{}");
  

  // Obtener proyecto y organización del estudiante
  const enrolledProjects = Array.isArray(studentData?.enrollments)
    ? studentData.enrollments
        .map(enrollment => {
          const project = projects.find(p => p.id_proyecto === enrollment.id_proyecto);
          const org = organizations.find(o => o.id_organizacion === enrollment.id_organizacion);
          if (!project) return null;
          return { ...project, org, periodo: enrollment.periodo };
        })
        .filter(Boolean)
    : [];

  const handleGoHome = () => {
    navigate("/student/slots"); 
  };


  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 600, color: "#2479bd" }}
          >
            ¡Felicidades!
          </Typography>

        {enrolledProjects.length > 0 ? (
          <Box sx={{ mb: 4, color: "text.secondary" }}>
            {/* Texto principal más grande */}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {`Has quedado inscrito en el proyecto "${enrolledProjects[0].nombre_proyecto}" de la organización "${enrolledProjects[0].org.nombre_osf}".`}
            </Typography>

            {/* Texto secundario más pequeño */}
            <Typography variant="body2">
              En caso de necesitarlo, podrás ver tu estatus en cualquier momento en tu perfil.
            </Typography>
          </Box>
        ) : (
          <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
            Has quedado inscrito en el servicio social.
          </Typography>
        )}

          <Button
            variant="contained"
            size="large"
            onClick={handleGoHome}
            sx={{
              backgroundColor: "#a855f7",
              "&:hover": {
                backgroundColor: "#a855f7",
              },
            }}
          >
            Regresar a la página principal
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentEnrollConfirm;