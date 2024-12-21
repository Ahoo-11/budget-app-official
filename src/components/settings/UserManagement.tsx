import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InviteUserDialog } from "./InviteUserDialog";
import { UserRolesTable } from "./UserRolesTable";
import { InvitationsTable } from "./InvitationsTable";

type UserRole = 'super_admin' | 'admin' | 'viewer';

interface User {
  id: string;
  role?: UserRole;
}

interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  password: string;
}

export function UserManagement() {
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      return userRoles.map(userRole => ({
        id: userRole.user_id,
        role: userRole.role as UserRole
      }));
    }
  });

  const { data: invitations = [], refetch: refetchInvitations } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('status', 'pending') // Only fetch pending invitations
        .gt('expires_at', new Date().toISOString()) // Only fetch non-expired invitations
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(invitation => ({
        ...invitation,
        password: 'Welcome123!' // Add the default password to each invitation
      })) as Invitation[];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Management</h3>
        <InviteUserDialog onInviteSent={refetchInvitations} />
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-4">Current Users</h4>
          <UserRolesTable users={users} onRoleUpdate={refetchUsers} />
        </div>

        {invitations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-4">Pending Invitations</h4>
            <InvitationsTable invitations={invitations} />
          </div>
        )}
      </div>
    </div>
  );
}