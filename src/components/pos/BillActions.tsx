import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bill } from "@/types/bill";
import { FilePlus, Receipt } from "lucide-react";

interface BillActionsProps {
  onNewBill: () => void;
  onSwitchBill: (billId: string) => void;
  activeBills: Bill[];
  activeBillId: string | null;
  isSubmitting: boolean;
}

export const BillActions = ({ 
  onNewBill, 
  onSwitchBill, 
  activeBills, 
  activeBillId,
  isSubmitting 
}: BillActionsProps) => {
  const uncompletedBills = activeBills.filter(bill => bill.status === 'active');

  return (
    <div className="flex justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onNewBill}
              className="h-9 w-9"
              disabled={isSubmitting}
            >
              <FilePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Bill</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 relative"
                >
                  <Receipt className="h-4 w-4" />
                  {uncompletedBills.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {uncompletedBills.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Active Bills</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {uncompletedBills.map((bill) => (
                    <div
                      key={bill.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        bill.id === activeBillId ? 'border-primary' : ''
                      }`}
                      onClick={() => onSwitchBill(bill.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Bill #{bill.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </TooltipTrigger>
          <TooltipContent>
            <p>Active Bills</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};