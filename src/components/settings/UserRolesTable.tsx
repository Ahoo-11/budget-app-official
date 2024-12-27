import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { User, UserRole, UserStatus } from "@/types/roles";
import { useUserRoleManagement } from "./hooks/useUserRoleManagement";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleSelect } from "./user-roles/RoleSelect";
import { UserStatusCell } from "./user-roles/UserStatusCell";
import { UserActionsCell } from "./user-roles/UserActionsCell";
import { Button } from "../ui/button";
import { ManageSourcesDialog } from "./ManageSourcesDialog";

interface UserRolesTableProps {
  users: User[];
  onRoleUpdate: () => void;
}

export function UserRolesTable({ users, onRoleUpdate }: UserRolesTableProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

      return profiles.reduce((acc: Record<string, { email: string; status: UserStatus }>, profile) => {
        acc[profile.id] = { 
          email: profile.email, 
          status: profile.status as UserStatus 
        };
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
    if (userRole === 'controller') {
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
                  onChange={(newRole) => handleRoleChange(user.id, newRole)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {getUserSourcesInfo(user.id, user.role)}
                  </span>
                  {!isPending && user.role !== 'controller' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <UserActionsCell
                  userId={user.id}
                  status={userStatus}
                  disabled={updating}
                  onApprove={handleApproveUser}
                  onReject={handleRejectUser}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {selectedUserId && (
        <ManageSourcesDialog
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={onRoleUpdate}
        />
      )}
    </Table>
  );
}