import { Bill } from "@/types/bill";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

    fetchCustomerName();
  }, [bill.payer_id]);

  // Calculate total amount from bill items
  const totalAmount = bill.total || 0;

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
            <p className="font-medium">MVR {totalAmount.toFixed(2)}</p>
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};