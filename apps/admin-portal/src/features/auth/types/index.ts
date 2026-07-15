export type AppRole = 'SYSTEM_ADMIN' | 'PARK_MANAGER' | 'SALES_STAFF' | 'OPERATIONS_STAFF';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AppRole;
  venueId?: number;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
