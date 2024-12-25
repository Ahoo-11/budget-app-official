export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer' | 'controller';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}