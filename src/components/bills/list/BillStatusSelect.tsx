import { Bill } from "@/types/bills";
import { Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BillStatusSelectProps {
  status: Bill['status'];
  onStatusChange: (status: Bill['status']) => void;
  isUpdating: boolean;
}

export const BillStatusSelect = ({ status, onStatusChange, isUpdating }: BillStatusSelectProps) => {
  const getStatusIcon = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'partially_paid':
        return <DollarSign className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'partially_paid':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Select
      value={status}
      onValueChange={onStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={cn(
        "h-8 w-[130px] inline-flex items-center gap-1 text-xs font-medium",
        getStatusColor(status)
      )}>
        <SelectValue>
          <span className="flex items-center gap-1">
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        </SelectItem>
        <SelectItem value="partially_paid">
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Partially Paid
          </span>
        </SelectItem>
        <SelectItem value="paid">
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            Paid
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};