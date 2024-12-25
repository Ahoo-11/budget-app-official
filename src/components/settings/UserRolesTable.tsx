import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleSelect } from "./user-roles/RoleSelect";
import { SourcesInfo } from "./user-roles/SourcesInfo";

export type UserRole = 'super_admin' | 'admin' | 'viewer';

interface User {
  id: string;
  email?: string;
  role?: UserRole;
}

interface Source {
  id: string;
  name: string;
}

export function UserRolesTable({ users, onRoleUpdate }: { 
  users: User[], 
  onRoleUpdate: () => void 
}) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: userEmails } = useQuery({
    queryKey: ['userEmails'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email');

      if (error) {
        console.error('Error fetching profiles:', error);
        return {};
      }

      return profiles.reduce((acc: Record<string, string>, profile) => {
        acc[profile.id] = profile.email;
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

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      // Fixed: invalidateQueries instead of invalidateQuery
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userRoles'] }),
        queryClient.invalidateQueries({ queryKey: ['sourcePermissions'] }),
      ]);
      
      onRoleUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

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
          <TableHead>Role</TableHead>
          <TableHead>Sources Access</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{userEmails?.[user.id] || 'Loading...'}</TableCell>
            <TableCell>
              <RoleSelect
                value={user.role}
                disabled={updating}
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}