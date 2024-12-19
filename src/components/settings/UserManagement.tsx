import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

type UserRole = 'super_admin' | 'admin' | 'viewer';

interface User {
  id: string;
  email: string;
  role?: UserRole;
}

export function UserManagement() {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // First get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Then get user data for each role
      const usersWithData = await Promise.all(
        userRoles.map(async (userRole) => {
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userRole.user_id);
          if (userError) {
            console.error('Error fetching user:', userError);
            return {
              id: userRole.user_id,
              email: 'Unknown User',
              role: userRole.role as UserRole
            };
          }
          return {
            id: userRole.user_id,
            email: user?.email || 'Unknown User',
            role: userRole.role as UserRole
          };
        })
      );

      return usersWithData;
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
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">User Management</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}