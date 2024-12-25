import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface UserActionsCellProps {
  isPending: boolean;
  updating: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function UserActionsCell({ isPending, updating, onApprove, onReject }: UserActionsCellProps) {
  if (!isPending) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onApprove}
        disabled={updating}
        className="bg-green-50 hover:bg-green-100 text-green-700"
      >
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReject}
        disabled={updating}
        className="bg-red-50 hover:bg-red-100 text-red-700"
      >
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
}