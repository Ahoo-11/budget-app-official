import { Button } from "@/components/ui/button";
import { UserStatus } from "@/types/roles";

interface UserActionsCellProps {
  userId: string;
  status?: UserStatus;
  disabled?: boolean;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
}

export function UserActionsCell({ 
  userId,
  status,
  disabled,
  onApprove,
  onReject 
}: UserActionsCellProps) {
  if (status !== 'pending') return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onApprove(userId)}
      >
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onReject(userId)}
      >
        Reject
      </Button>
    </div>
  );
}