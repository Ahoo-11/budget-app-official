import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon, PlusCircle, RepeatIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_fixed: boolean;
}

interface RecurringTransactionsProps {
  sourceId: string;
}

export const RecurringTransactions = ({ sourceId }: RecurringTransactionsProps) => {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const { toast } = useToast();

  const { data: recurringTransactions = [] } = useQuery({
    queryKey: ['recurring-transactions', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('source_id', sourceId)
        .order('next_due_date');
      
      if (error) throw error;
      return data as RecurringTransaction[];
    },
  });

  const handleAddTransaction = () => {
    setIsAddingTransaction(true);
    toast({
      title: "Coming Soon",
      description: "The ability to add recurring transactions will be available soon.",
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Manage recurring income and expenses for this source
          </p>
        </div>
        <Button onClick={handleAddTransaction} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Recurring
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recurringTransactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RepeatIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">{transaction.description}</h3>
              </div>
              <span className={`flex items-center ${
                transaction.type === 'income' ? 'text-success' : 'text-destructive'
              }`}>
                {transaction.type === 'income' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-1" />
              Next due: {format(new Date(transaction.next_due_date), 'PPP')}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-secondary capitalize">
                {transaction.frequency}
              </span>
              {transaction.is_fixed && (
                <span className="px-2 py-1 rounded-full bg-secondary">
                  Fixed amount
                </span>
              )}
            </div>
            
            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
        
        {recurringTransactions.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <RepeatIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No recurring transactions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding your first recurring transaction for this source
            </p>
            <Button onClick={handleAddTransaction} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Recurring Transaction
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};