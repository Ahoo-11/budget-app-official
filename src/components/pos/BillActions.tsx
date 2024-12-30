import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bill } from "@/types/bill";
import { FilePlus, History } from "lucide-react";

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
                  className="h-9 w-9"
                >
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Recent Bills</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {activeBills.map((bill) => (
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
                          <span className={`px-2 py-1 rounded-full ${
                            bill.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bill.status}
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
            <p>Recent Bills</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};