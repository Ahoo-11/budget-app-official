import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type UserRole = 'super_admin' | 'admin' | 'viewer';

export function InviteUserDialog({ onInviteSent }: { onInviteSent: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [selectedSource, setSelectedSource] = useState<string>("none");
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

  const handleCreateUser = async () => {
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

      if (selectedSource === "none") {
        toast({
          title: "Error",
          description: "Please select a source for the new user",
          variant: "destructive",
        });
        return;
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { role }
      });

      if (authError) throw authError;

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: authData.user.id, role });

      if (roleError) throw roleError;

      // Create source permission
      const { error: permError } = await supabase
        .from('source_permissions')
        .insert({
          user_id: authData.user.id,
          source_id: selectedSource,
          can_view: true,
          can_create: role !== 'viewer',
          can_edit: role !== 'viewer',
          can_delete: role === 'admin' || role === 'super_admin'
        });

      if (permError) throw permError;

      toast({
        title: "Success",
        description: `User created successfully: ${email}`,
      });
      setEmail("");
      setRole("viewer");
      setSelectedSource("none");
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
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Select 
              value={selectedSource} 
              onValueChange={setSelectedSource}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source (required)" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleCreateUser} 
            className="w-full"
            disabled={isLoading || !selectedSource || selectedSource === "none"}
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}