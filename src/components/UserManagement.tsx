import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { useState } from "react";

type UserRole = 'admin' | 'manager' | 'viewer';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const { data: currentUserRole } = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roleData, error: roleError } = await supabase
        .schema('budget')
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      return roleData?.role ?? null;
    }
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      // Get all users from auth.users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        });
        return [];
      }

      // Get roles for all users
      const { data: roles, error: rolesError } = await supabase
        .schema('budget')
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return [];
      }

      // Map roles to users
      return authUsers.map(user => {
        const userRole = roles?.find(r => r.user_id === user.id);
        return {
          id: user.id,
          email: user.email || '',
          role: (userRole?.role as UserRole) || 'viewer'
        };
      });
    },
    enabled: currentUserRole === 'admin'
  });

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    if (!userId || updating) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .schema('budget')
        .from('user_roles')
        .upsert(
          { user_id: userId, role: newRole },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (currentUserRole !== 'admin') {
    return (
      <div className="text-center py-4">
        You don't have permission to manage users.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Management</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  {['admin', 'manager', 'viewer'].map((role) => (
                    <Button
                      key={role}
                      variant={user.role === role ? "default" : "outline"}
                      size="sm"
                      disabled={updating || user.role === role}
                      onClick={() => handleRoleUpdate(user.id, role as UserRole)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}