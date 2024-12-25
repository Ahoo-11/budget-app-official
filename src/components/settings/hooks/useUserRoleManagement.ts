import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { UserRole } from "@/types/roles";

interface UseUserRoleManagementProps {
  toast: any;
  setUpdating: (updating: boolean) => void;
  queryClient: QueryClient;
  onRoleUpdate: () => void;
}

export function useUserRoleManagement({
  toast,
  setUpdating,
  queryClient,
  onRoleUpdate
}: UseUserRoleManagementProps) {
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
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

  const handleApproveUser = async (userId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;

      await handleRoleChange(userId, 'viewer');

      toast({
        title: "Success",
        description: "User approved successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userEmails'] });
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User rejected successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['userEmails'] });
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return {
    handleRoleChange,
    handleApproveUser,
    handleRejectUser
  };
}