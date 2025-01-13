import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionManager } from "@/components/session/SessionManager";
import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";
import { addDays, subDays } from "date-fns";
import { useState } from "react";

export default function Index() {
  const [dateRange, setDateRange] = useState({
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
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const defaultSourceId = sources?.[0]?.id;

  return (
    <div className="space-y-6">
      {defaultSourceId && <SessionManager sourceId={defaultSourceId} />}
      <DailyTransactionsChart 
        transactions={transactions} 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
}