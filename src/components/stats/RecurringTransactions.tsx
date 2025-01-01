import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_fixed: boolean;
}

export const RecurringTransactions = () => {
  const { data: recurringTransactions = [] } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_due_date');
      
      if (error) throw error;
      return data as RecurringTransaction[];
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recurring Transactions</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {recurringTransactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{transaction.description}</h3>
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
              <span className="px-2 py-1 rounded-full bg-secondary">
                {transaction.frequency}
              </span>
              {transaction.is_fixed && (
                <span className="px-2 py-1 rounded-full bg-secondary">
                  fixed amount
                </span>
              )}
            </div>
          </Card>
        ))}
        {recurringTransactions.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No recurring transactions found
          </div>
        )}
      </div>
    </div>
  );
};