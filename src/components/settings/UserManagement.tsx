import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InviteUserDialog } from "./InviteUserDialog";
import { UserRolesTable } from "./UserRolesTable";

type UserRole = 'super_admin' | 'admin' | 'viewer';

interface User {
  id: string;
  role?: UserRole;
}

export function UserManagement() {
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (profilesError) throw profilesError;

      // Then get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Create a map of user roles
      const roleMap = userRoles.reduce((acc: Record<string, UserRole>, role) => {
        acc[role.user_id] = role.role as UserRole;
        return acc;
      }, {});

      // Map all profiles to users, including those without roles
      return profiles.map(profile => ({
        id: profile.id,
        role: roleMap[profile.id]
      }));
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Management</h3>
        <InviteUserDialog onInviteSent={refetchUsers} />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-4">Current Users</h4>
        <UserRolesTable users={users} onRoleUpdate={refetchUsers} />
      </div>
    </div>
  );
}