import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionManager } from "@/components/session/SessionManager";
import { DailyTransactionsChart } from "@/components/DailyTransactionsChart";

export default function Index() {
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

  const defaultSourceId = sources?.[0]?.id;

  return (
    <div className="space-y-6">
      {defaultSourceId && <SessionManager sourceId={defaultSourceId} />}
      <DailyTransactionsChart />
    </div>
  );
}