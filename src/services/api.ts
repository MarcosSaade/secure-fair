/**
 * Axios API Instance
 * 
 * Configured axios instance with automatic JWT token injection
 * and response/error handling for all API requests.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCurrentToken, tokenStorage } from '../utils/tokenStorage';

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to requests if available
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCurrentToken();
    
    // If token exists and is valid, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response patterns and errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful response as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - token might be invalid or expired
          // Clear stored auth data
          tokenStorage.clearAll();
          
          // Only redirect to login if not already on login page
          if (window.location.pathname !== '/login') {
            // Use replace to prevent back button issues
            window.location.replace('/login');
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error: No response from server');
    } else {
      // Error in request configuration
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Response wrapper type for consistent responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Helper function to extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Check for API response error message
    const apiError = error.response?.data as ApiResponse;
    if (apiError?.message) {
      return apiError.message;
    }
    
    // Check for validation errors
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      return firstError?.[0] || 'Validation error';
    }
    
    // Default axios error message
    return error.message || 'An error occurred';
  }
  
  // Generic error
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Helper to check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

/**
 * Helper to check if error is a permission error
 */
export const isPermissionError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
};

export default apiClient;
