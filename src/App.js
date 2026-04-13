import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';

// Demo for the QR Scanner
import DemoAccess from './pages/DemoAccess';
// Dummies
import {students as dummyStudents} from './pages/students';
import { projects as projectsData } from "./pages/projects";
import { organizations as dummiesOrg } from "./pages/organization";
import {users} from './pages/users';

// ==================== LAYOUTS ====================
import StudentLayout from './layouts/StudentLayout';
import SocioLayout from './layouts/SocioLayout';
import AdminLayout from './layouts/AdminLayout';
import BecarioLayout from './layouts/BecarioLayout';


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
import AdminProfile from './pages/admin/AdminProfie';

// ==================== BECARIO-FORMADOR PAGES ====================
import BecarioProfile from './pages/becario/BecarioProfile.js';
import MainPageBec from './pages/becario/main_pageBec';
import CheckInBecario from './pages/becario/checkInBecario';

// ==================== SOCIO-FORMADOR PAGES ====================
import MainSocio from './pages/socio/main_pageSocio';
import SocioGenerateCode from './pages/socio/generatecode';
import SocioProfile from './pages/socio/profile';


// ==================== PLACEHOLDER PAGES ====================
import { Box } from '@mui/material';

const StudentResult = () => <Box sx={{ p: 4 }}>Final Enrollment Result</Box>;
const AdminImport = () => <Box sx={{ p: 4 }}>Import Data</Box>;
const AdminExport = () => <Box sx={{ p: 4 }}>Export Data</Box>;
const NotFound = () => <Box sx={{ p: 4 }}>404 - Page Not Found</Box>;
//const STORAGE_KEY = "studentAccounts";

function App() {

    // Initialize dummy student accounts in localStorage if not already present
    React.useEffect(() => {
      // Inicializar solo si localStorage está vacío
      if (!localStorage.getItem("estudiantes")) {
        const estudiantesArray = Object.values(dummyStudents);
        console.log("Guardando estudiantes dummy:", estudiantesArray);
        localStorage.setItem("estudiantes", JSON.stringify(estudiantesArray));
      }

      if (!localStorage.getItem("organizaciones")) {
        localStorage.setItem("organizaciones", JSON.stringify(dummiesOrg));
      }

      if (!localStorage.getItem("proyectos")) {
        const proyectosIniciales = projectsData.map(p => ({
          ...p,
          inscritos: p.inscritos || 0
        }));
        localStorage.setItem("proyectos", JSON.stringify(proyectosIniciales));
      }

      //  Initialize admins - filter from dummy users
      if (!localStorage.getItem("admins")) {
        const adminsArray = users.filter(user => user.tipo === "admin");
        console.log("Guardando admins dummy:", adminsArray);
        localStorage.setItem("admins", JSON.stringify(adminsArray));
      }

      //  Initialize socios - filter from dummy users
      if (!localStorage.getItem("socios")) {
        const sociosArray = users.filter(user => user.tipo === "socio");
        console.log("Guardando socios dummy:", sociosArray);
        localStorage.setItem("socios", JSON.stringify(sociosArray));
      }

      //  Initialize usuarios collection (for login tracking)
      if (!localStorage.getItem("usuarios")) {
        const usuariosArray = users.map(user => ({
          id_usuario: user.id_usuario,
          username: user.username,
          contraseña: user.contraseña,
          tipo: user.tipo,
          activo: user.activo,
          ...(user.id_organizacion && { id_organizacion: user.id_organizacion })
        }));
        console.log("Guardando usuarios dummy:", usuariosArray);
        // Save as object with id_usuario as key for StorageService compatibility
        const usuariosObj = {};
        usuariosArray.forEach(user => {
          usuariosObj[user.id_usuario] = user;
        });
        localStorage.setItem("usuarios", JSON.stringify(usuariosObj));
      }
    }, []);
    // Routes
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

          {/* ==================== BECARIO-FORMADOR ROUTES (Nested with BecarioLayout) ==================== */}
          <Route path="/becario/*" element={<BecarioLayout />}>
            <Route index element={<MainPageBec />} />
            <Route path="profile" element={<BecarioProfile />} />
            <Route path="checkin_bec" element={<CheckInBecario />} />
          </Route>

          {/* ==================== FALLBACK ROUTE ==================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;