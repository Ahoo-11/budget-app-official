import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/roles";

interface UserStatusCellProps {
  status?: UserStatus;
}

export function UserStatusCell({ status }: UserStatusCellProps) {
  if (!status) return null;

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}