import { supabase } from "@/integrations/supabase/client";

type UserRole = 'super_admin' | 'admin' | 'viewer';

export const createUser = async (
  email: string, 
  role: UserRole, 
  sourceId: string | 'none',
  defaultPassword: string = 'Welcome123@'
) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: {
      email,
      role,
      sourceId,
      password: defaultPassword,
    },
  });

  if (error) {
    console.error('Error in createUser:', error);
    throw error;
  }

  return data.user;
};