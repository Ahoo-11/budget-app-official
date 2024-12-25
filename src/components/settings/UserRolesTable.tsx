import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

type UserRole = 'super_admin' | 'admin' | 'viewer';

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

  // Fetch user emails from profiles table
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

  // Fetch sources and permissions for each user
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

      // Group permissions by user_id
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
      
      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQuery({ queryKey: ['userRoles'] }),
        queryClient.invalidateQuery({ queryKey: ['sourcePermissions'] }),
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
              <Select
                disabled={updating}
                value={user.role}
                onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <HoverCard>
                <HoverCardTrigger>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">
                      {getUserSourcesInfo(user.id, user.role)}
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Source Access Details</h4>
                    <p className="text-sm">
                      {getUserSourcesInfo(user.id, user.role)}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}