import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ServiceGrid } from "@/components/pos/ServiceGrid";
import { ServiceForm } from "@/components/services/ServiceForm";

interface ServicesIncomeProps {
  sourceId: string;
}

export const ServicesIncome = ({ sourceId }: ServicesIncomeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Service</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ServiceForm sourceId={sourceId} onSuccess={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <ServiceGrid sourceId={sourceId} />
    </div>
  );
};