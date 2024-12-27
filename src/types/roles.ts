export type UserRole = 'controller' | 'super_admin' | 'admin' | 'viewer';

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