import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useTypes } from "@/hooks/useTypes";
import { EmploymentIncomeForm } from "./forms/EmploymentIncomeForm";

export function EmploymentIncome({ sourceId }: { sourceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { types, isTypeEnabled } = useTypes(sourceId);

  const handleSuccess = async () => {
    setIsOpen(false);
  };

  const { data: entries = [] } = useQuery({
    queryKey: ["employment-entries", sourceId],
    queryFn: async () => {
      const employmentType = types.find(t => t.name === "Employment Income");
      if (!employmentType || !isTypeEnabled(employmentType.id)) return [];

      const { data, error } = await supabase
        .from("income_entries")
        .select(`
          *,
          type_subcategories (
            name
          )
        `)
        .eq("source_id", sourceId)
        .eq("type_id", employmentType.id);

      if (error) throw error;
      return data;
    },
    enabled: types.length > 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employment Income</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Employment Income
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Employment Income</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <EmploymentIncomeForm sourceId={sourceId} onSubmit={handleSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {entry.amount} - {entry.type_subcategories?.name}
          </li>
        ))}
      </ul>
    </div>
  );
}