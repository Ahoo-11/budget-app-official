import { Bill } from "@/types/bill";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillListItemProps {
  bill: Bill;
  isSelected: boolean;
  onSelect: (billId: string, isSelected: boolean) => void;
  activeBillId: string | null;
  onBillClick: (billId: string) => void;
}

export const BillListItem = ({
  bill,
  isSelected,
  onSelect,
  activeBillId,
  onBillClick,
}: BillListItemProps) => {
  const getStatusIcon = (status: Bill['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'partially_paid':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'partially_paid':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg space-y-2 cursor-pointer transition-colors",
        activeBillId === bill.id ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={() => onBillClick(bill.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelect(bill.id, checked as boolean);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="font-medium">Bill #{bill.id.slice(0, 8)}</span>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
          getStatusColor(bill.status)
        )}>
          {getStatusIcon(bill.status)}
          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {bill.items.length} items
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span>Total</span>
        <span className="font-medium">{formatCurrency(bill.total)}</span>
      </div>
    </div>
  );
};