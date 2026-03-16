/**
 * ProtectedRoute
 *
 * Wraps routes that require authentication (and optionally a specific role).
 * Redirects to /login if the user is unauthenticated.
 * Redirects to their home dashboard if they lack the required role.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  /** If provided, only users with one of these roles may access the route. */
  allowedRoles?: UserRole[];
}

const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.SOCIO]: '/socio',
  [UserRole.STUDENT]: '/student',
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    // User is logged in but doesn't have the required role – send to their own home
    const home = ROLE_HOME[user.role as UserRole] ?? '/login';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
