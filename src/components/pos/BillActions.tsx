import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bill } from "@/types/bill";
import { FilePlus, Receipt } from "lucide-react";
import { BillListItem } from "./bills/BillListItem";
import { BillBulkActions } from "./bills/BillBulkActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BillActionsProps {
  onNewBill: () => void;
  onSwitchBill: (billId: string) => void;
  activeBills: Bill[];
  activeBillId: string | null;
  isSubmitting: boolean;
  setSelectedProducts: (products: any[]) => void;
}

export const BillActions = ({ 
  onNewBill, 
  onSwitchBill, 
  activeBills = [],
  activeBillId,
  isSubmitting,
  setSelectedProducts
}: BillActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  console.log('📋 Active bills in BillActions:', activeBills);
  console.log('🎯 Current active bill ID:', activeBillId);
  
  const uncompletedBills = activeBills.filter(bill => bill.status === 'active');
  console.log('📝 Uncompleted bills:', uncompletedBills);
  
  const isAllSelected = uncompletedBills.length > 0 && selectedBills.length === uncompletedBills.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedBills(checked ? uncompletedBills.map(bill => bill.id) : []);
  };

  const handleSelectBill = (billId: string, isSelected: boolean) => {
    setSelectedBills(prev =>
      isSelected
        ? [...prev, billId]
        : prev.filter(id => id !== billId)
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .in('id', selectedBills);

      if (error) throw error;

      // Clear selected products if active bill is being deleted
      if (selectedBills.includes(activeBillId || '')) {
        setSelectedProducts([]);
      }

      // Clear selected bills
      setSelectedBills([]);
      
      // Close the sheet
      setIsSheetOpen(false);

      // Invalidate the bills query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['bills'] });

      toast({
        title: "Bills deleted",
        description: `Successfully deleted ${selectedBills.length} ${selectedBills.length === 1 ? 'bill' : 'bills'}.`,
      });
    } catch (error) {
      console.error('Error deleting bills:', error);
      toast({
        title: "Error",
        description: "Failed to delete bills. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBillClick = (billId: string) => {
    onSwitchBill(billId);
    setIsSheetOpen(false);
  };

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
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <div className="mt-4">
                  <BillBulkActions
                    selectedBills={selectedBills}
                    onSelectAll={handleSelectAll}
                    isAllSelected={isAllSelected}
                    onDeleteSelected={handleDeleteSelected}
                    totalBills={uncompletedBills.length}
                  />
                  <div className="mt-4 space-y-4">
                    {uncompletedBills.map((bill) => (
                      <BillListItem
                        key={bill.id}
                        bill={bill}
                        isSelected={selectedBills.includes(bill.id)}
                        onSelect={handleSelectBill}
                        activeBillId={activeBillId}
                        onBillClick={handleBillClick}
                      />
                    ))}
                  </div>
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