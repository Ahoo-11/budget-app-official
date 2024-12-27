export type UserRole = 'super_admin' | 'admin' | 'viewer' | 'controller' | 'manager';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export type UserRoleInfo = {
  id: string;
  role?: UserRole;
};