import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { IncomeForm } from "./IncomeForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface EmploymentIncomeProps {
  sourceId: string;
}

export const EmploymentIncome = ({ sourceId }: EmploymentIncomeProps) => {
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);

  const { data: incomeEntries, isLoading } = useQuery({
    queryKey: ['income-entries', sourceId, 'employment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          income_type:income_types(name),
          subcategory:income_subcategories(name)
        `)
        .eq('source_id', sourceId)
        .eq('income_type_id', (await supabase
          .from('income_types')
          .select('id')
          .eq('name', 'Employment Income')
          .single()).data?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading income entries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Employment Income</h3>
        <Button onClick={() => setIsAddingIncome(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incomeEntries?.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{entry.name}</h4>
                <p className="text-sm text-muted-foreground">{entry.subcategory?.name}</p>
                <p className="text-sm font-medium mt-2">${entry.amount}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingIncome(entry)}
              >
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog 
        open={isAddingIncome} 
        onOpenChange={setIsAddingIncome}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Add Employment Income</DialogTitle>
          </DialogHeader>
          <IncomeForm
            sourceId={sourceId}
            onSuccess={() => setIsAddingIncome(false)}
            incomeType="Employment Income"
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!editingIncome} 
        onOpenChange={(open) => !open && setEditingIncome(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[450px] p-4">
          <DialogHeader>
            <DialogTitle>Edit Employment Income</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <IncomeForm
              sourceId={sourceId}
              income={editingIncome}
              onSuccess={() => setEditingIncome(null)}
              incomeType="Employment Income"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};