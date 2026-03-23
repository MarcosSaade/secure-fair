import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';

// Demo for the QR Scanner
import DemoAccess from './pages/DemoAccess';

// ==================== LAYOUTS ====================
import StudentLayout from './layouts/StudentLayout';
import SocioLayout from './layouts/SocioLayout';
import AdminLayout from './layouts/AdminLayout';

// ==================== AUTHENTICATION PAGES ====================
import SignIn from './pages/SignIn';
import Login from './pages/Login';



// ==================== STUDENT PAGES ====================
import StudentRegister from "./pages/student/StudentRegister";
import StudentQR from './pages/student/StudentQR';
import StudentSlots from './pages/student/StudentSlots';
import EnrollForm from './pages/student/EnrollForm';
import StudentConfirmation from './pages/student/StudentConfirmation';
import StudentProfile from './pages/student/StudentProfile';

// ==================== ADMIN PAGES ====================
import AdminMain from './pages/admin/main_page';
import AdminEdit from './pages/admin/edit';
import EditOrganization from './pages/admin/editOrganization';
import AdminCheckIn from './pages/admin/checkIn';

// ==================== SOCIO-FORMADOR PAGES ====================
import MainSocio from './pages/socio/main_pageSocio';
import SocioGenerateCode from './pages/socio/generatecode';
import SocioProfile from './pages/socio/profile';

// ==================== PLACEHOLDER PAGES ====================
import { Box } from '@mui/material';

const StudentResult = () => <Box sx={{ p: 4 }}>Final Enrollment Result</Box>;
const AdminImport = () => <Box sx={{ p: 4 }}>Import Data</Box>;
const AdminExport = () => <Box sx={{ p: 4 }}>Export Data</Box>;
const AdminProfile = () => <Box sx={{ p: 4 }}>Admin Profile</Box>;
const NotFound = () => <Box sx={{ p: 4 }}>404 - Page Not Found</Box>;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* ==================== AUTHENTICATION ROUTES ==================== */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />

          {/* ==================== DEMO ACCESS (Remove in production) ==================== */}
          <Route path="/demo" element={<DemoAccess />} />

          {/* ==================== ROOT REDIRECT ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ==================== STUDENT ROUTES (Nested with StudentLayout) ==================== */}
          <Route path="/student/*" element={<StudentLayout />}>
            <Route index element={<StudentRegister />} />
            <Route path="register" element={<StudentRegister />} />
            <Route path="qr" element={<StudentQR />} />
            <Route path="slots" element={<StudentSlots />} />
            <Route path="enrollform" element={<EnrollForm />} />
            <Route path="confirmation" element={<StudentConfirmation />} />
            <Route path="result" element={<StudentResult />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* ==================== SOCIO-FORMADOR ROUTES (Nested with SocioLayout) ==================== */}
          <Route path="/socio/*" element={<SocioLayout />}>
            <Route index element={<MainSocio />} />
            <Route path="main_pageSocio/:orgId" element={<MainSocio />} />
            <Route path="generatecode" element={<SocioGenerateCode />} />
            <Route path="profile" element={<SocioProfile />} />
          </Route>

          {/* ==================== ADMIN ROUTES (Nested with AdminLayout) ==================== */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminMain />} />
            <Route path="main_page" element={<AdminMain />} />
            <Route path="edit" element={<AdminEdit />} />
            <Route path="editOrganization" element={<EditOrganization />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="export" element={<AdminExport />} />
            <Route path="checkin" element={<AdminCheckIn />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* ==================== FALLBACK ROUTE ==================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;