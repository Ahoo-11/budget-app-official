import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InventoryManager } from "@/components/inventory/InventoryManager";
import { InventoryForm } from "@/components/inventory/InventoryForm";

interface InventoryIncomeProps {
  sourceId: string;
}

export const InventoryIncome = ({ sourceId }: InventoryIncomeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Inventory
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Inventory Item</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <InventoryForm sourceId={sourceId} onSuccess={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <InventoryManager sourceId={sourceId} />
    </div>
  );
}