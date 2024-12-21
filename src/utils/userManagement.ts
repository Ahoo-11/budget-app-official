import { supabase } from "@/integrations/supabase/client";

type UserRole = 'super_admin' | 'admin' | 'viewer';

export const createUser = async (
  email: string, 
  role: UserRole, 
  sourceId: string | 'none',
  defaultPassword: string = 'Welcome123@'
) => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      role,
      sourceId,
      password: defaultPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }

  const data = await response.json();
  return data.user;
};