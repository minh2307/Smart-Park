export type UserRole = 'SYSTEM_ADMIN' | 'PARK_MANAGER' | 'SALES_STAFF' | 'OPERATIONS_STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
  lastUpdated: string;
  avatarUrl?: string;
  permissions?: string[];
}

export interface UserFilters {
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  page?: number;
  size?: number;
  sort?: string;
}

export interface UserListResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
}
