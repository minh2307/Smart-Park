export type UserRole = 'ADMIN' | 'NHAN_VIEN' | 'MANAGER' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
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
