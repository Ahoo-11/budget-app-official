export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer' | 'controller' | 'pending';

export interface User {
  id: string;
  email?: string;
  role?: UserRole;
  status?: 'pending' | 'approved' | 'rejected';
}