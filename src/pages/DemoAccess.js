// This is just a Demo of how the QR should work. When backend is ready, this should be removed.
// How to use:
// 1. Click "See GREEN QR" to simulate a student whose access time is now (GREEN QR).
// Aftter being validated, you'll be able to see the StudentSlots and register at any project.
// 2. Click "See RED QR" to simulate a student whose access time is in the future (RED QR).
// 3. Click "Admin" to test the admin check-in and scanning flow.
// 4. Use "Logout" to clear session and return here.
// 5. Use "Cleanup Test Data" to remove old test students from localStorage.
// To enter please use this: http://localhost:3000/demo 

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Alert,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearOldTestData } from '../services/studentService';
import logo from './Logo.png';


const DemoAccess = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Create a student that's ready NOW (GREEN QR)
  const loginAsStudentReady = () => {
    // Set Maria's access time to 7:00 AM
    const accessTime = '7:00 AM';

    const studentData = {
      user_id: Date.now(),
      username: 'student_ready',
      password: 'Demo1234!',
      nombre: 'María',
      apellidos: 'García López',
      matricula: 'A01659877',
      carrera: 'Ingeniería en Sistemas',
      correo: 'maria@gmail.com',
      celular: '+1 (555) 987-6543',
      hora_registro: accessTime,
      project_id: 1,
      orgID: 2,
      registered_at: new Date().toISOString().split('T')[0],
      checked_in_at: null,
    };

    const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    studentAccounts['student_ready'] = studentData;
    localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));

    sessionStorage.setItem('username', 'student_ready');
    sessionStorage.setItem('type', 'student');
    sessionStorage.setItem('studentData', JSON.stringify(studentData));
    sessionStorage.setItem('password', 'Demo1234!');

    navigate('/student/qr');
  };

  // Quick test: Show RED immediately (testing only)
  const quickTestRED = () => {
    const now = new Date();
    // Set time to 2 hours from now
    const futureHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
   
    const minutes = String(futureHours.getMinutes()).padStart(2, '0');
    const period = futureHours.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = futureHours.getHours() % 12 || 12;
    
    const futureTime = `${displayHours}:${minutes} ${period}`;

    const studentData = {
      user_id: Date.now(),
      username: 'student_red_test',
      password: 'Demo1234!',
      nombre: 'Test',
      apellidos: 'Red Student',
      matricula: 'A99999999',
      carrera: 'Testing',
      correo: 'test@gmail.com',
      celular: '+1 (555) 111-1111',
      hora_registro: futureTime,
      project_id: 1,
      orgID: 2,
      registered_at: new Date().toISOString().split('T')[0],
      checked_in_at: null,
    };

    const studentAccounts = JSON.parse(localStorage.getItem('studentAccounts') || '{}');
    studentAccounts['student_red_test'] = studentData;
    localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));

    sessionStorage.setItem('username', 'student_red_test');
    sessionStorage.setItem('type', 'student');
    sessionStorage.setItem('studentData', JSON.stringify(studentData));
    sessionStorage.setItem('password', 'Demo1234!');

    navigate('/student/qr');
  };

  const loginAsAdmin = () => {
    sessionStorage.setItem('username', 'admin1');
    sessionStorage.setItem('type', 'admin');
    navigate('/admin');
  };

  const clearSession = () => {
    sessionStorage.clear();
    console.log('✓ Session cleared');
    navigate('/login');
  };

  const cleanupData = () => {
    clearOldTestData();
    alert('Test data cleaned up! Only valid students kept.');
  };

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
            p: { xs: 3, sm: 4 },
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: { xs: 80, sm: 120 },
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 1,
              textAlign: 'center',
            }}
          >
             Demo Access
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              textAlign: 'center',
            }}
          >
            Testing the QR validation flow
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
             Esta página debe eliminarse en producción
          </Alert>

          {/* Testing Steps */}
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 1,
              }}
            >
              Quick Test:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              • <strong> GREEN:</strong> QR aprobado
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              • <strong> RED:</strong> QR cuando no es su turno
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              • <strong> ADMIN:</strong> Test CheckIn 
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Student Green Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={loginAsStudentReady}
              sx={{
                backgroundColor: theme.palette.success.main,
                color: 'white',
                py: 1.75,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: theme.palette.success.dark,
                },
              }}
            >
               See GREEN QR (Ready)
            </Button>

            {/* Quick Test Red Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={quickTestRED}
              sx={{
                backgroundColor: theme.palette.error.main,
                color: 'white',
                py: 1.75,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
               See RED QR (Not Ready)
            </Button>

            {/* Admin Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={loginAsAdmin}
              sx={{
                backgroundColor: theme.palette.info.main,
                color: 'white',
                py: 1.75,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: theme.palette.info.dark,
                },
              }}
            >
               Admin (CheckIn & Scan)
            </Button>

            {/* Clear Session Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={clearSession}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                py: 1.75,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: theme.palette.background.default,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
               Logout
            </Button>

            {/* Cleanup Button */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={cleanupData}
              sx={{
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
                py: 1,
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: `${theme.palette.warning.main}15`,
                  borderColor: theme.palette.warning.dark,
                },
              }}
            >
               Cleanup Test Data
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DemoAccess;