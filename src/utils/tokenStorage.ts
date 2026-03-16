/**
 * Token Storage Utility
 * 
 * Handles secure storage and retrieval of JWT tokens in localStorage.
 * Provides methods for token management and automatic cleanup.
 */

import { JWTPayload } from '../types/auth';

const TOKEN_KEY = 'secure_fair_token';
const USER_KEY = 'secure_fair_user';

/**
 * Token Storage Interface
 */
export const tokenStorage = {
  /**
   * Store JWT token in localStorage
   * @param token - JWT access token
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  /**
   * Retrieve JWT token from localStorage
   * @returns JWT token or null if not found
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  /**
   * Store user data in localStorage
   * @param user - User object
   */
  setUser(user: unknown): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },

  /**
   * Retrieve user data from localStorage
   * @returns User object or null if not found
   */
  getUser<T>(): T | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  },

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  /**
   * Clear all auth-related data from localStorage
   */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  },

  /**
   * Check if token exists
   * @returns boolean indicating token presence
   */
  hasToken(): boolean {
    return !!this.getToken();
  },

  /**
   * Decode JWT token payload (without verification)
   * Note: This only decodes the payload for reading data.
   * Actual verification happens on the backend.
   * 
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode base64url payload
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param token - JWT token to check
   * @returns boolean indicating if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  },

  /**
   * Get token expiration time
   * @param token - JWT token
   * @returns Date object or null if invalid
   */
  getTokenExpiration(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return null;
    }

    // Convert seconds to milliseconds
    return new Date(payload.exp * 1000);
  },

  /**
   * Validate token format and expiration
   * @param token - JWT token to validate
   * @returns boolean indicating if token is valid
   */
  isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }

    // Check format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check expiration
    return !this.isTokenExpired(token);
  }
};

/**
 * Get current token with validation
 * @returns Valid token or null
 */
export const getCurrentToken = (): string | null => {
  const token = tokenStorage.getToken();
  
  if (!token) {
    return null;
  }

  // Check if token is expired
  if (tokenStorage.isTokenExpired(token)) {
    // Auto-cleanup expired token
    tokenStorage.clearAll();
    return null;
  }

  return token;
};

export default tokenStorage;
