import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InvestmentIncomeForm } from "./forms/InvestmentIncomeForm";
import { useIncomeEntries } from "@/hooks/useIncomeEntries";

interface InvestmentIncomeProps {
  sourceId: string;
}

export const InvestmentIncome = ({ sourceId }: InvestmentIncomeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addIncome } = useIncomeEntries({ sourceId });

  const handleSuccess = async (data: any) => {
    await addIncome.mutateAsync(data);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investment Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Investment Income
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Investment Income</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <InvestmentIncomeForm sourceId={sourceId} onSubmit={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};