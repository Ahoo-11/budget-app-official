import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InviteUserDialog } from "./InviteUserDialog";
import { UserRolesTable } from "./UserRolesTable";
import { UserRole } from "@/types/roles";

export function UserManagement() {
  const { data: currentUserRole } = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role as UserRole;
    },
    staleTime: 0
  });

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (currentUserRole !== 'controller' && currentUserRole !== 'super_admin') {
        throw new Error('Unauthorized access');
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const roleMap = userRoles.reduce((acc: Record<string, UserRole>, role) => {
        acc[role.user_id] = role.role as UserRole;
        return acc;
      }, {});

      return profiles.map(profile => ({
        id: profile.id,
        role: roleMap[profile.id] || 'viewer'
      }));
    },
    enabled: !!currentUserRole && (currentUserRole === 'controller' || currentUserRole === 'super_admin'),
    staleTime: 0
  });

  if (currentUserRole !== 'controller' && currentUserRole !== 'super_admin') {
    return null;
  }

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