/**
 * useAuth Hook & AuthProvider
 *
 * Provides React context for authentication state:
 * - Current user & token
 * - login / logout actions
 * - Loading state during initial token verification
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  createElement,
} from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { AuthContextType, LoginCredentials, User } from '../types/auth';

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session if a valid token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenStorage.getToken();
      if (storedToken && tokenStorage.isTokenValid(storedToken)) {
        try {
          // Validate token against the backend and get fresh user data
          const freshUser = await authService.getCurrentUser();
          setToken(storedToken);
          setUser(freshUser);
        } catch {
          // Token is invalid or expired – clear storage
          tokenStorage.clearAll();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const data = await authService.login(credentials);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
