/**
 * Token Storage Tests
 * 
 * Unit tests for JWT token storage utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenStorage } from '../tokenStorage';

describe('Token Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Token Management', () => {
    it('should store and retrieve token', () => {
      const token = 'test.jwt.token';
      tokenStorage.setToken(token);
      expect(tokenStorage.getToken()).toBe(token);
    });

    it('should remove token', () => {
      tokenStorage.setToken('test.token');
      tokenStorage.removeToken();
      expect(tokenStorage.getToken()).toBeNull();
    });

    it('should check if token exists', () => {
      expect(tokenStorage.hasToken()).toBe(false);
      tokenStorage.setToken('test.token');
      expect(tokenStorage.hasToken()).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should store and retrieve user', () => {
      const user = { id: '1', email: 'test@example.com', role: 'STUDENT' };
      tokenStorage.setUser(user);
      expect(tokenStorage.getUser()).toEqual(user);
    });

    it('should remove user', () => {
      const user = { id: '1', email: 'test@example.com' };
      tokenStorage.setUser(user);
      tokenStorage.removeUser();
      expect(tokenStorage.getUser()).toBeNull();
    });
  });

  describe('Clear All', () => {
    it('should clear all auth data', () => {
      tokenStorage.setToken('test.token');
      tokenStorage.setUser({ id: '1', email: 'test@example.com' });

      tokenStorage.clearAll();

      expect(tokenStorage.getToken()).toBeNull();
      expect(tokenStorage.getUser()).toBeNull();
    });
  });

  describe('Token Decoding', () => {
    it('should decode valid JWT token', () => {
      // Create a mock JWT token (header.payload.signature)
      // Payload: {"sub":"123","email":"test@example.com","role":"STUDENT","exp":9999999999,"iat":1234567890}
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxMjM0NTY3ODkwfQ.signature';
      
      const decoded = tokenStorage.decodeToken(mockToken);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('123');
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.role).toBe('STUDENT');
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';
      const decoded = tokenStorage.decodeToken(invalidToken);
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt';
      const decoded = tokenStorage.decodeToken(malformedToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should detect expired token', () => {
      // Token with exp in the past
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjEwMDAwMDAwMDB9.signature';
      expect(tokenStorage.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should detect valid token', () => {
      // Token with exp far in the future
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.signature';
      expect(tokenStorage.isTokenExpired(validToken)).toBe(false);
    });

    it('should validate token format and expiration', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.signature';
      expect(tokenStorage.isTokenValid(validToken)).toBe(true);

      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjEwMDAwMDAwMDB9.signature';
      expect(tokenStorage.isTokenValid(expiredToken)).toBe(false);

      expect(tokenStorage.isTokenValid(null)).toBe(false);
      expect(tokenStorage.isTokenValid('invalid')).toBe(false);
    });
  });

  describe('Token Expiration Time', () => {
    it('should get token expiration date', () => {
      // Token exp: 9999999999 (Sep 2286)
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.signature';
      const expDate = tokenStorage.getTokenExpiration(token);
      
      expect(expDate).not.toBeNull();
      expect(expDate).toBeInstanceOf(Date);
      expect(expDate?.getTime()).toBe(9999999999000); // exp * 1000
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';
      const expDate = tokenStorage.getTokenExpiration(invalidToken);
      expect(expDate).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => tokenStorage.setToken('test')).not.toThrow();
      expect(() => tokenStorage.setUser({ id: '1' })).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should handle localStorage retrieval errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      // Should not throw and return null
      expect(tokenStorage.getToken()).toBeNull();
      expect(tokenStorage.getUser()).toBeNull();

      getItemSpy.mockRestore();
    });
  });
});
