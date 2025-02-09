import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";

export function GiftsIncome({ sourceId }: { sourceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { types, isTypeEnabled } = useTypes(sourceId);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const { data: entries = [] } = useQuery({
    queryKey: ["gifts-entries", sourceId],
    queryFn: async () => {
      const giftsType = types.find(t => t.name === "Gifts and Grants");
      if (!giftsType || !isTypeEnabled(giftsType.id)) return [];

      const typeId = giftsType.id;

      const { data: incomeEntries } = await supabase
        .from('budgetapp_income_entries')
        .select('*')
        .eq('source_id', sourceId)
        .eq('type_id', typeId)

      if (!incomeEntries) {
        return []
      }

      return incomeEntries.map(entry => ({
        id: entry.id,
        amount: entry.amount,
        description: entry.description,
        date: entry.date
      }))
    },
    enabled: types.length > 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gifts and Grants Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Gift Income
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Gift Income</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {/* TODO: Implement GiftIncomeForm */}
              <div>Gift Income Form Coming Soon</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {entry.amount} - {entry.description}
          </li>
        ))}
      </ul>
    </div>
  );
}