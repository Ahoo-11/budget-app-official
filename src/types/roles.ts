export type UserRole = 'controller' | 'admin' | 'viewer';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}