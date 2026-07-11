export type UserRole = 'ADMIN' | 'NHAN_VIEN' | 'CUSTOMER' | 'GUEST';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface CustomerProfile {
  id: number;
  fullName: string;
  phone: string;
  birthDate?: string;
  gender?: number; // 0: Nữ, 1: Nam
  address?: string;
  status: number;
}
