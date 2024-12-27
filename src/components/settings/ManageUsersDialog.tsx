import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ManageUsersDialogProps {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ManageUsersDialog({ userId, onClose, onUpdate }: ManageUsersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Get current user's email to check if they're the controller
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get target user's current role and email
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo', userId],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError && roleError.code !== 'PGRST116') throw roleError;

      setSelectedRole(role?.role || 'viewer');
      
      return {
        email: profile.email,
        role: role?.role || 'viewer'
      };
    },
  });

  const isController = currentUser?.email === 'ahoo11official@gmail.com';
  const isTargetController = userInfo?.email === 'ahoo11official@gmail.com';

  const handleSave = async () => {
    if (!selectedRole || !isController) return;

    setUpdating(true);
    try {
      // Don't allow changing controller's role
      if (isTargetController) {
        toast({
          title: "Error",
          description: "Cannot modify the controller account's role",
          variant: "destructive",
        });
        return;
      }

      // Update or insert role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: selectedRole
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      await queryClient.invalidateQueries({ queryKey: ['userRole'] });

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!isController) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-500">
            Only the controller account can manage user roles.
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isTargetController ? (
            <div className="text-sm text-gray-500">
              This is the controller account. Its role cannot be modified.
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500">
                Select the role for this user:
              </div>
              <RadioGroup
                value={selectedRole || ''}
                onValueChange={setSelectedRole}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin (can manage assigned sources)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="viewer" id="viewer" />
                  <Label htmlFor="viewer">Viewer (read-only access)</Label>
                </div>
              </RadioGroup>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            {!isTargetController && (
              <Button onClick={handleSave} disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
