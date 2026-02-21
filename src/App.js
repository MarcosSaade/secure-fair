import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import './App.css';

// ==================== LAYOUTS ====================
import StudentLayout from './layouts/StudentLayout';
import SocioLayout from './layouts/SocioLayout';
import AdminLayout from './layouts/AdminLayout';

// ==================== AUTHENTICATION PAGES ====================
import SignIn from './pages/SignIn';
import Login from './pages/Login';

// ==================== STUDENT PAGES ====================
const StudentHome = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4">Hello World! 👋</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Welcome, Student</Typography>
  </Box>
);
const StudentRegister = () => <Box sx={{ p: 4 }}>Student Registration Form</Box>;
const StudentRegisterStatus = () => <Box sx={{ p: 4 }}>Registration Status Validation</Box>;
const StudentQR = () => <Box sx={{ p: 4 }}>QR Validation Screen</Box>;
const StudentConfirmation = () => <Box sx={{ p: 4 }}>Policy Acceptance & Code Entry</Box>;
const StudentResult = () => <Box sx={{ p: 4 }}>Final Enrollment Result</Box>;
const StudentProfile = () => <Box sx={{ p: 4 }}>Student Profile & Status</Box>;

// ==================== SOCIO-FORMADOR PAGES ====================
const SocioDashboard = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4">Hello World! 👋</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Welcome, Socio-Formador</Typography>
  </Box>
);
const SocioGenerateCode = () => <Box sx={{ p: 4 }}>Generate Code</Box>;
const SocioProfile = () => <Box sx={{ p: 4 }}>Socio Profile</Box>;

// ==================== ADMIN PAGES ====================
const AdminDashboard = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4">Hello World! 👋</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Welcome, Administrator</Typography>
  </Box>
);
const AdminImport = () => <Box sx={{ p: 4 }}>Import Data</Box>;
const AdminExport = () => <Box sx={{ p: 4 }}>Export Data</Box>;
const AdminEdit = () => <Box sx={{ p: 4 }}>Edit Management</Box>;
const AdminCheckIn = () => <Box sx={{ p: 4 }}>Check-In</Box>;
const AdminProfile = () => <Box sx={{ p: 4 }}>Admin Profile</Box>;

// ==================== NOT FOUND ====================
const NotFound = () => <Box sx={{ p: 4 }}>404 - Page Not Found</Box>;

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== AUTHENTICATION ROUTES ==================== */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />

        {/* ==================== ROOT REDIRECT ==================== */}
        <Route path="/" element={<Navigate to="/signin" />} />
        

        {/* ==================== STUDENT ROUTES (Nested with StudentLayout) ==================== */}
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/register/status" element={<StudentRegisterStatus />} />
          <Route path="/student/qr" element={<StudentQR />} />
          <Route path="/student/confirmation" element={<StudentConfirmation />} />
          <Route path="/student/result" element={<StudentResult />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>

        {/* ==================== SOCIO-FORMADOR ROUTES (Nested with SocioLayout) ==================== */}
        <Route element={<SocioLayout />}>
          <Route path="/socio" element={<SocioDashboard />} />
          <Route path="/socio/projects/:project_id/code" element={<SocioGenerateCode />} />
          <Route path="/socio/profile" element={<SocioProfile />} />
        </Route>

        {/* ==================== ADMIN ROUTES (Nested with AdminLayout) ==================== */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/import" element={<AdminImport />} />
          <Route path="/admin/export" element={<AdminExport />} />
          <Route path="/admin/edit" element={<AdminEdit />} />
          <Route path="/admin/checkin" element={<AdminCheckIn />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* ==================== FALLBACK ROUTE ==================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
