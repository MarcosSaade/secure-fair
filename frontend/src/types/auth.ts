/**
 * Authentication and User Types
 *
 * These types define the structure for authentication-related data
 * including user information, login credentials, and JWT tokens.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  SOCIO = 'SOCIO',
  STUDENT = 'STUDENT',
}

/** Mirrors backend UserResponse exactly */
export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Mirrors backend LoginResponse exactly */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** JWT Token Payload (decoded) */
export interface JWTPayload {
  sub: string; // user_id
  email: string;
  role: UserRole;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}
