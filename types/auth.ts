export interface RoleInfo {
  _id: string;
  roleName: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  roleId: string | RoleInfo;
  role?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  roleId?: string;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
