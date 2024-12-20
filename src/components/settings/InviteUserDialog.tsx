import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [selectedSource, setSelectedSource] = useState<string>("none");
  const [isOpen, setIsOpen] = useState(false);

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

  const handleInviteUser = async () => {
    try {
      // Use Supabase's native invite feature
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        data: {
          role: inviteRole,
          source_id: selectedSource !== 'none' ? selectedSource : null
        }
      });

      if (error) throw error;

      // If a source is selected, store the source permission
      if (selectedSource && selectedSource !== 'none') {
        const { error: permissionError } = await supabase
          .from('source_permissions')
          .insert({
            user_id: data.user?.id,
            source_id: selectedSource,
            can_view: true,
            can_create: inviteRole !== 'viewer',
            can_edit: inviteRole !== 'viewer',
            can_delete: inviteRole === 'super_admin'
          });

        if (permissionError) throw permissionError;
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setInviteEmail("");
      setInviteRole("viewer");
      setSelectedSource("none");
      setIsOpen(false);
      onInviteSent();
    } catch (error) {
      console.error('Invitation error:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select value={inviteRole} onValueChange={(value: UserRole) => setInviteRole(value)}>
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
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No source</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInviteUser} className="w-full">
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}