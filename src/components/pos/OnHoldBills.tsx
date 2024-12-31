import { Bill } from "@/types/bill";
import { PauseCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OnHoldBillsProps {
  bills: Bill[];
  onSwitchBill: (billId: string) => void;
  activeBillId: string | null;
}

export const OnHoldBills = ({ bills, onSwitchBill, activeBillId }: OnHoldBillsProps) => {
  const onHoldBills = bills.filter(bill => bill.status === 'on-hold');

  if (onHoldBills.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-2">
      {onHoldBills.map((bill) => (
        <TooltipProvider key={bill.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSwitchBill(bill.id)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  bill.id === activeBillId ? 'bg-gray-100 ring-2 ring-black' : ''
                }`}
              >
                <PauseCircle className="h-5 w-5 text-orange-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>On-hold Bill #{bill.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(bill.created_at).toLocaleString()}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};