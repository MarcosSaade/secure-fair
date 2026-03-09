/**
 * App.tsx – Client-side routing
 *
 * Route structure:
 *   /              → redirect to /login
 *   /login         → LoginPage (public)
 *   /admin/*       → AdminDashboard (ADMIN only)
 *   /socio/*       → SocioDashboard (SOCIO only)
 *   /student/*     → StudentDashboard (STUDENT only)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SocioDashboard from './pages/socio/SocioDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { UserRole } from './types/auth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Socio routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.SOCIO]} />}>
            <Route path="/socio/*" element={<SocioDashboard />} />
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/student/*" element={<StudentDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
