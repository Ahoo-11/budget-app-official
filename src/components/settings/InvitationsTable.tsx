import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
}

export function InvitationsTable({ invitations }: { invitations: Invitation[] }) {
  const { toast } = useToast();

  const handleResendInvitation = async (email: string, role: string) => {
    try {
      const { error } = await supabase.functions.invoke('resend-invitation', {
        body: { email, role }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    } catch (error) {
      console.error('Resend invitation error:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>{invitation.email}</TableCell>
            <TableCell>{invitation.role}</TableCell>
            <TableCell>{invitation.status}</TableCell>
            <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              {invitation.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResendInvitation(invitation.email, invitation.role)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}