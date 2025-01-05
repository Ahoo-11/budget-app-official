import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionList } from "./TransactionList";
import { Transaction } from "@/types/transaction";
import { DateRange } from "react-day-picker";
import { FiltersCard } from "@/components/stats/FiltersCard";

export const TransactionListContainer = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string>("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', selectedSource],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('source_id', selectedSource === 'all' ? null : selectedSource);

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!dateRange?.from || transactionDate >= dateRange.from) &&
      (!dateRange?.to || transactionDate <= dateRange.to)
    );
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <FiltersCard
        date={dateRange}
        setDate={setDateRange}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <TransactionList transactions={filteredTransactions} />
    </div>
  );
};
