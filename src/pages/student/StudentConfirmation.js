import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
} from "@mui/material";

const StudentEnrollConfirm = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/signin"); 
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

          <Typography
            variant="body1"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            Has quedado inscrito en el servicio social.
          </Typography>

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
