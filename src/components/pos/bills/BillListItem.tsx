import { Bill } from "@/types/bill";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getBillStatus } from "@/utils/creditUtils";
import { AlertCircle, Check, DollarSign, XCircle } from "lucide-react";

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
  const [customerName, setCustomerName] = useState<string>("Walk-in Customer");
  const [status, setStatus] = useState(bill.status);

  useEffect(() => {
    const fetchCustomerName = async () => {
      if (bill.payer_id) {
        const { data, error } = await supabase
          .from('payers')
          .select('name')
          .eq('id', bill.payer_id)
          .single();
        
        if (!error && data) {
          setCustomerName(data.name);
        }
      }
    };

    const checkBillStatus = async () => {
      if (bill.status === 'pending') {
        const currentStatus = await getBillStatus(
          new Date(bill.date),
          bill.source_id,
          bill.payer_id
        );
        setStatus(currentStatus);
      } else {
        setStatus(bill.status);
      }
    };

    fetchCustomerName();
    checkBillStatus();
  }, [bill.payer_id, bill.status, bill.date, bill.source_id]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'active':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'partially_paid':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'In Progress';
      case 'partially_paid':
        return 'Partially Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg hover:bg-gray-50 flex items-start gap-3",
        bill.id === activeBillId ? "border-primary" : ""
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(bill.id, checked as boolean)}
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="flex-1 cursor-pointer"
        onClick={() => onBillClick(bill.id)}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{customerName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(bill.created_at).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">MVR {bill.total.toFixed(2)}</p>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={cn("px-2 py-1 rounded-full text-sm", getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};