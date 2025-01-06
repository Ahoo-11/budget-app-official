import { Bill } from "@/types/bills";
import { Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillListItemProps {
  bill: Bill;
}

export const BillListItem = ({ bill }: BillListItemProps) => {
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
    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Bill #{bill.id.slice(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">
            Created: {new Date(bill.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Items: {bill.items.length}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">Total: MVR {bill.total?.toFixed(2)}</p>
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(bill.status)
          )}>
            {getStatusIcon(bill.status)}
            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1).replace('_', ' ')}
          </div>
          {bill.payer_name && (
            <p className="text-sm text-muted-foreground mt-1">
              Payer: {bill.payer_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};