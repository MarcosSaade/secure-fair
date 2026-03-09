/**
 * Authentication Module Exports
 *
 * Central export point for all authentication-related utilities,
 * services, and types.
 */

// Types
export type {
  User,
  LoginCredentials,
  LoginResponse,
  AuthContextType,
  JWTPayload,
} from './types/auth';

export { UserRole } from './types/auth';

// Token Storage
export {
  tokenStorage,
  getCurrentToken,
} from './utils/tokenStorage';

// Auth Service
export { authService } from './services/authService';

// API Client
export { default as apiClient, getErrorMessage, isAuthError, isPermissionError } from './services/api';
export type { ApiResponse } from './services/api';

