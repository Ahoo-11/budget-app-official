export interface CreateUserPayload {
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  sourceId: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}