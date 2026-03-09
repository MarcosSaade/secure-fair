/**
 * Authentication Service
 *
 * Handles all authentication-related API calls:
 * login, logout, and fetching current user information.
 *
 * Backend contract:
 *   POST /auth/login  → { access_token, token_type, expires_in, user }
 *   GET  /auth/me     → { id, email, role, full_name, created_at }
 */

import apiClient, { getErrorMessage } from './api';
import { LoginCredentials, LoginResponse, User } from '../types/auth';
import { tokenStorage } from '../utils/tokenStorage';

export const authService = {
  /**
   * Login user and persist token + user to localStorage.
   * Returns the full login response (token + user).
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { access_token, user } = response.data;

      tokenStorage.setToken(access_token);
      tokenStorage.setUser(user);

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /** Clear all stored auth data (client-side logout). */
  logout(): void {
    tokenStorage.clearAll();
  },

  /**
   * Fetch current user from backend.
   * Validates the token and returns fresh user data.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      tokenStorage.setUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /** Return cached user from localStorage (no API call). */
  getStoredUser(): User | null {
    return tokenStorage.getUser<User>();
  },

  /** Check if a valid token exists in localStorage. */
  isAuthenticated(): boolean {
    const token = tokenStorage.getToken();
    return tokenStorage.isTokenValid(token);
  },

  /** Re-fetch and cache the current user. */
  async refreshUser(): Promise<User> {
    return this.getCurrentUser();
  },

  /**
   * Verify token by making a real API call.
   * More reliable than client-side expiry checks.
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      this.logout();
      return false;
    }
  },
};

export default authService;
