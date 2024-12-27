import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/roles";
import { QueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

interface UseUserRoleManagementProps {
  toast: ReturnType<typeof useToast>["toast"];
  setUpdating: Dispatch<SetStateAction<boolean>>;
  queryClient: QueryClient;
  onRoleUpdate: () => void;
}

export function useUserRoleManagement({
  toast,
  setUpdating,
  queryClient,
  onRoleUpdate,
}: UseUserRoleManagementProps) {
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['users'] });
      onRoleUpdate();
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
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

  const handleApproveUser = async (userId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['userEmails'] });
      onRoleUpdate();
      toast({
        title: "User approved",
        description: "User has been successfully approved.",
      });
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve user. Please try again.",
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

      queryClient.invalidateQueries({ queryKey: ['userEmails'] });
      onRoleUpdate();
      toast({
        title: "User rejected",
        description: "User has been successfully rejected.",
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject user. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return {
    handleRoleChange,
    handleApproveUser,
    handleRejectUser,
  };
}