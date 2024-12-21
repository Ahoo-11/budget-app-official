import { supabase } from "@/integrations/supabase/client";

type UserRole = 'super_admin' | 'admin' | 'viewer';

export const createUser = async (
  email: string, 
  role: UserRole, 
  sourceId: string | 'none',
  defaultPassword: string
) => {
  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: defaultPassword,
    options: {
      emailRedirectTo: `${window.location.origin}/auth`
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Failed to create user");

  // Create user role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role: role
    });

  if (roleError) throw roleError;

  // If a source was selected, create source permission
  if (sourceId !== 'none') {
    const { error: permissionError } = await supabase
      .from('source_permissions')
      .insert({
        user_id: authData.user.id,
        source_id: sourceId,
        can_view: true,
        can_create: role !== 'viewer',
        can_edit: role !== 'viewer',
        can_delete: role === 'admin' || role === 'super_admin'
      });

    if (permissionError) throw permissionError;
  }

  return authData.user;
};