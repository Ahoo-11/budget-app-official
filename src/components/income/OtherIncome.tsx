import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { OtherIncomeForm } from "./forms/OtherIncomeForm";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";

interface OtherIncomeProps {
  sourceId: string;
}

export const OtherIncome = ({ sourceId }: OtherIncomeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addIncome } = useIncomeEntries({ sourceId });

  const handleSuccess = async (data: any) => {
    await addIncome.mutateAsync(data);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Other Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Other Income
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Other Income</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <OtherIncomeForm sourceId={sourceId} onSubmit={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};