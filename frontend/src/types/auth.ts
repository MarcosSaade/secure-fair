/**
 * Authentication and User Types
 * 
 * These types define the structure for authentication-related data
 * including user information, login credentials, and JWT tokens.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  SOCIO = 'SOCIO',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  email: string;
    full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    user: User;
  };
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// JWT Token Payload (decoded)
export interface JWTPayload {
  sub: string; // user_id
  email: string;
  role: UserRole;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}
