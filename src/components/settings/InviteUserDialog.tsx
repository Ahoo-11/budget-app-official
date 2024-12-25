import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ManageUserForm } from "./ManageUserForm";

type UserRole = 'super_admin' | 'admin' | 'viewer';

export function InviteUserDialog({ onInviteSent }: { onInviteSent: () => void }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.role;
    }
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: existingUsers = [] } = useQuery({
    queryKey: ['existingUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (error) throw error;
      return data;
    },
  });

  const isSuperAdmin = userRole === 'super_admin';

  const handleUpdateUser = async ({ userId, role, sourceId }: { userId: string; role: UserRole; sourceId: string }) => {
    try {
      setIsLoading(true);
      if (!isSuperAdmin) {
        toast({
          title: "Error",
          description: "Only super admins can manage user roles",
          variant: "destructive",
        });
        return;
      }

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

      if (roleError) throw roleError;

      // Update source permissions
      const { error: permError } = await supabase
        .from('source_permissions')
        .upsert({
          user_id: userId,
          source_id: sourceId,
          can_view: true,
          can_create: role !== 'viewer',
          can_edit: role !== 'viewer',
          can_delete: role === 'super_admin' || role === 'admin'
        }, { onConflict: '(user_id, source_id)' });

      if (permError) throw permError;

      toast({
        title: "Success",
        description: "User permissions updated successfully",
      });
      setIsOpen(false);
      onInviteSent();
    } catch (error) {
      console.error('Permission update error:', error);
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Manage User Access
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Access</DialogTitle>
          <DialogDescription>
            Assign roles and source access to existing users.
          </DialogDescription>
        </DialogHeader>
        <ManageUserForm 
          sources={sources}
          existingUsers={existingUsers}
          onSubmit={handleUpdateUser}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}