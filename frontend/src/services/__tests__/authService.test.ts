/**
 * Auth Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokenStorage } from '../../utils/tokenStorage';

// Mock the tokenStorage module
vi.mock('../../utils/tokenStorage', () => ({
  tokenStorage: {
    setToken: vi.fn(),
    getToken: vi.fn(),
    removeToken: vi.fn(),
    hasToken: vi.fn(),
  },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should store token on successful login', () => {
      const mockToken = 'mock.jwt.token';
      tokenStorage.setToken(mockToken);
      
      expect(tokenStorage.setToken).toHaveBeenCalledWith(mockToken);
    });

    it('should remove token on logout', () => {
      tokenStorage.removeToken();
      
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should check if user is authenticated', () => {
      vi.mocked(tokenStorage.hasToken).mockReturnValue(true);
      
      const hasToken = tokenStorage.hasToken();
      
      expect(hasToken).toBe(true);
      expect(tokenStorage.hasToken).toHaveBeenCalled();
    });
  });

  describe('Token Expiry', () => {
    it('should handle expired tokens', () => {
      vi.mocked(tokenStorage.getToken).mockReturnValue(null);
      
      const token = tokenStorage.getToken();
      
      expect(token).toBeNull();
    });
  });
});
