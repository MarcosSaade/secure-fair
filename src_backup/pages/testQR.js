import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const TestQR = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // This is the exact QR that will be displayed to students
  const testQRValue = JSON.stringify({
    username: 'student_demo',
    matricula: 'A01659876',
    nombre: 'Juan Pérez García',
    timestamp: new Date().toISOString(),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            🔍 Test QR Code
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
            }}
          >
            Escanea este código con tu dispositivo en CheckIn
          </Typography>

          {/* QR Code */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
            }}
          >
            <QRCodeCanvas
              value={testQRValue}
              size={300}
              fgColor={theme.palette.primary.main}
              bgColor="#ffffff"
              level="H"
              includeMargin={true}
            />
          </Box>

          {/* Student Info */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: `${theme.palette.primary.main}15`,
              border: `1px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="caption" sx={{ display: 'block' }}>
              <strong>Nombre:</strong> Juan Pérez García
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              <strong>Matrícula:</strong> A01659876
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              <strong>Usuario:</strong> student_demo
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/demo')}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              ← Volver
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/admin/checkin')}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              }}
            >
              Ir a CheckIn →
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TestQR;