import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionManager } from "@/components/session/SessionManager";
import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";
import { subDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Transaction } from "@/types/transaction";

export default function Index() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: sources } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', dateRange.from?.toISOString() || '')
        .lte('date', dateRange.to?.toISOString() || '');
      
      if (error) throw error;
      
      // Ensure the type field is correctly typed as "income" | "expense"
      return (data || []).map(transaction => ({
        ...transaction,
        type: transaction.type as "income" | "expense"
      })) as Transaction[];
    }
  });

  const defaultSourceId = sources?.[0]?.id;

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  return (
    <div className="space-y-6">
      {defaultSourceId && <SessionManager sourceId={defaultSourceId} />}
      <DailyTransactionsChart 
        transactions={transactions} 
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
}