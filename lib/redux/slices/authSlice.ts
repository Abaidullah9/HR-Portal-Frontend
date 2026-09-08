import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthUser,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponseData,
  ApiResponse,
} from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Helper to get initial user data from localStorage in browser environment
const getInitialStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialStoredUser(),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async Thunk: Login User
export const loginUser = createAsyncThunk<
  AuthResponseData,
  LoginCredentials,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<AuthResponseData> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      return rejectWithValue(data.message || 'Login failed. Please check your credentials.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data.data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to connect to server';
    return rejectWithValue(message);
  }
});

// Async Thunk: Register User
export const registerUser = createAsyncThunk<
  AuthResponseData,
  RegisterCredentials,
  { rejectValue: string }
>('auth/registerUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<AuthResponseData> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      return rejectWithValue(data.message || 'Registration failed.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data.data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to connect to server';
    return rejectWithValue(message);
  }
});

// Async Thunk: Fetch Current User (Session check)
export const fetchCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>('auth/fetchCurrentUser',  async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<AuthUser> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      return rejectWithValue(data.message || 'Failed to authenticate session');
    }

    return data.data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Session verification failed';
    return rejectWithValue(message);
  }
});

// Async Thunk: Logout User
export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    try {
      await fetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
        state.isAuthenticated = false;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
