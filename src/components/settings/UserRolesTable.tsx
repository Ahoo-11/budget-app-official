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
import { useQuery } from "@tanstack/react-query";

type UserRole = 'super_admin' | 'admin' | 'viewer';

interface User {
  id: string;
  email?: string;
  role?: UserRole;
}

export function UserRolesTable({ users, onRoleUpdate }: { 
  users: User[], 
  onRoleUpdate: () => void 
}) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  // Fetch user emails from auth.users
  const { data: userEmails } = useQuery({
    queryKey: ['userEmails'],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return {};

      // Get current user's role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      // Only super_admin can fetch all user emails
      if (roleData?.role !== 'super_admin') return {};

      const { data: userData, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error('Error fetching users:', error);
        return {};
      }

      return userData.users.reduce((acc: Record<string, string>, user) => {
        acc[user.id] = user.email || '';
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
      onRoleUpdate();
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}