import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleSelect } from "./user-roles/RoleSelect";
import { SourcesInfo } from "./user-roles/SourcesInfo";
import { UserStatusCell } from "./user-roles/UserStatusCell";
import { UserActionsCell } from "./user-roles/UserActionsCell";
import { User, UserRole } from "@/types/roles";
import { useUserRoleManagement } from "./hooks/useUserRoleManagement";

export function UserRolesTable({ users, onRoleUpdate }: { 
  users: User[], 
  onRoleUpdate: () => void 
}) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { handleRoleChange, handleApproveUser, handleRejectUser } = useUserRoleManagement({
    toast,
    setUpdating,
    queryClient,
    onRoleUpdate
  });

  const { data: userEmails } = useQuery({
    queryKey: ['userEmails'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, status');

      if (error) {
        console.error('Error fetching profiles:', error);
        return {};
      }

      return profiles.reduce((acc: Record<string, { email: string; status: string }>, profile) => {
        acc[profile.id] = { email: profile.email, status: profile.status };
        return acc;
      }, {});
    }
  });

  const { data: sourcesData } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data: sources, error } = await supabase
        .from('sources')
        .select('id, name');

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      return sources;
    }
  });

  const { data: permissions } = useQuery({
    queryKey: ['sourcePermissions'],
    queryFn: async () => {
      const { data: perms, error } = await supabase
        .from('source_permissions')
        .select('user_id, source_id');

      if (error) {
        console.error('Error fetching permissions:', error);
        return {};
      }

      return perms.reduce((acc: Record<string, string[]>, perm) => {
        if (!acc[perm.user_id]) {
          acc[perm.user_id] = [];
        }
        acc[perm.user_id].push(perm.source_id);
        return acc;
      }, {});
    }
  });

  const getUserSourcesInfo = (userId: string, userRole?: UserRole) => {
    if (userRole === 'super_admin') {
      return 'Has access to all sources';
    }

    const userPermissions = permissions?.[userId] || [];
    if (userPermissions.length === 0) {
      return 'No sources assigned';
    }

    const accessibleSources = sourcesData
      ?.filter(source => userPermissions.includes(source.id))
      .map(source => source.name)
      .join(', ');

    return accessibleSources || 'No sources assigned';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Sources Access</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const userStatus = userEmails?.[user.id]?.status;
          const isPending = userStatus === 'pending';
          
          return (
            <TableRow key={user.id}>
              <TableCell>{userEmails?.[user.id]?.email || 'Loading...'}</TableCell>
              <TableCell>
                <UserStatusCell status={userStatus} />
              </TableCell>
              <TableCell>
                <RoleSelect
                  value={user.role}
                  disabled={updating || isPending}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                />
              </TableCell>
              <TableCell>
                <SourcesInfo
                  userId={user.id}
                  userRole={user.role}
                  sourcesInfo={getUserSourcesInfo(user.id, user.role)}
                />
              </TableCell>
              <TableCell>
                <UserActionsCell
                  isPending={isPending}
                  updating={updating}
                  onApprove={() => handleApproveUser(user.id)}
                  onReject={() => handleRejectUser(user.id)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}