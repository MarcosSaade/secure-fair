/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including
 * login, logout, and fetching current user information.
 */

import apiClient, { ApiResponse, getErrorMessage } from './api';
import { LoginCredentials, LoginResponse, User } from '../types/auth';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user and store authentication token
   * 
   * @param credentials - User email and password
   * @returns Promise with user data and token
   * @throws Error if login fails
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse['data']> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { access_token, user } = response.data.data;
        
        // Store token and user data in localStorage
        tokenStorage.setToken(access_token);
        tokenStorage.setUser(user);
        
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  },

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    // Clear all stored auth data
    tokenStorage.clearAll();
    
    // Optionally, you could make an API call to invalidate the token on the server
    // For JWT without server-side tracking, client-side removal is sufficient
  },

  /**
   * Get current authenticated user information from API
   * This validates the token and returns fresh user data
   * 
   * @returns Promise with current user data
   * @throws Error if user is not authenticated or token is invalid
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        // Update stored user data with fresh data
        tokenStorage.setUser(response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch user');
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  },

  /**
   * Get stored user from localStorage
   * This is a quick check without API call
   * 
   * @returns User object or null if not logged in
   */
  getStoredUser(): User | null {
    return tokenStorage.getUser<User>();
  },

  /**
   * Check if user is currently authenticated
   * Validates token existence and expiration
   * 
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = tokenStorage.getToken();
    return tokenStorage.isTokenValid(token);
  },

  /**
   * Refresh user data from API
   * Useful for updating user info after changes
   * 
   * @returns Promise with updated user data
   */
  async refreshUser(): Promise<User> {
    return this.getCurrentUser();
  },

  /**
   * Verify token validity by making an API call
   * More reliable than client-side checks
   * 
   * @returns Promise<boolean> indicating if token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      // Token is invalid, clear auth data
      this.logout();
      return false;
    }
  }
};

export default authService;
