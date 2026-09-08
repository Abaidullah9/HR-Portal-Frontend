import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  clearAuthError,
  logout,
  loginUser,
  registerUser,
  fetchCurrentUser,
} from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearAuthError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const result = authReducer(stateWithError, clearAuthError());
      expect(result.error).toBeNull();
    });

    it('should handle logout', () => {
      const authenticatedState = {
        ...initialState,
        user: { _id: '1', name: 'Test', email: 'test@test.com', roleId: 'role1', isActive: true },
        isAuthenticated: true,
      };
      const result = authReducer(authenticatedState, logout());
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('async thunks', () => {
    it('should handle loginUser.pending', () => {
      const action = { type: loginUser.pending.type };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle loginUser.rejected', () => {
      const action = {
        type: loginUser.rejected.type,
        payload: 'Login failed',
      };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(false);
      expect(result.error).toBe('Login failed');
      expect(result.isAuthenticated).toBe(false);
    });

    it('should handle registerUser.pending', () => {
      const action = { type: registerUser.pending.type };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it('should handle fetchCurrentUser.rejected', () => {
      const stateWithData = {
        ...initialState,
        user: { _id: '1', name: 'Test', email: 'test@test.com', roleId: 'role1', isActive: true },
        isAuthenticated: true,
      };
      const action = { type: fetchCurrentUser.rejected.type };
      const result = authReducer(stateWithData, action);
      expect(result.user).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });
  });
});
