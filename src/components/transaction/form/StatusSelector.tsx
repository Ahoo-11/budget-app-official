import { TransactionStatus } from "@/types/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusSelectorProps {
  status: TransactionStatus;
  setStatus: (status: TransactionStatus) => void;
  isSubmitting: boolean;
}

export const StatusSelector = ({
  status,
  setStatus,
  isSubmitting
}: StatusSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as TransactionStatus)}
        disabled={isSubmitting}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="partially_paid">Partially Paid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};