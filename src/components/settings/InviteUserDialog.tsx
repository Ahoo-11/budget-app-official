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
import { CreateUserForm } from "./CreateUserForm";

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

  const isSuperAdmin = userRole === 'super_admin';

  const handleCreateUser = async ({ email, role, sourceId }: { email: string; role: UserRole; sourceId: string }) => {
    try {
      setIsLoading(true);
      if (!isSuperAdmin) {
        toast({
          title: "Error",
          description: "Only super admins can create users",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          role,
          sourceId,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User created successfully: ${email}`,
      });
      setIsOpen(false);
      onInviteSent();
    } catch (error) {
      console.error('User creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
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
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account with specified permissions.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm 
          sources={sources}
          onSubmit={handleCreateUser}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}