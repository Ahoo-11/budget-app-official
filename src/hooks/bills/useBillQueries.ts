import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct } from "@/types/bills";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

type Tables = Database['public']['Tables'];
type BillRow = Tables['budgetapp_bills']['Row'];

interface BillWithPayer {
  id: string;
  amount: number;
  description: string | null;
  bill_date: string;
  source_id: string | null;
  created_at: string;
  updated_at: string;
  payer: {
    id: string;
    name: string;
  } | null;
}

export function useBillQueries(sourceId: string | null) {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBills = async () => {
    console.log('🔍 Fetching bills for source:', sourceId);
    try {
      if (!session?.user?.id) {
        console.log('No user session, skipping bill fetch');
        return [];
      }

      let query = supabase
        .from('budgetapp_bills')
        .select(`
          *,
          payer:budgetapp_payers!budgetapp_bills_payer_id_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (sourceId && sourceId !== 'all') {
        query = query.eq('source_id', sourceId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching bills:', error);
        toast({
          title: "Error fetching bills",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('📦 Fetched bills data:', data);
      
      return (data as unknown as BillWithPayer[]).map((bill) => ({
        id: bill.id,
        source_id: bill.source_id || '',
        user_id: session.user.id,
        date: bill.bill_date,
        created_at: bill.created_at,
        items: [],  // Items will be loaded separately
        discount: 0,
        subtotal: bill.amount,
        gst: 0,
        total: bill.amount,
        status: 'active',
        payer_id: bill.payer?.id,
        paid_amount: 0,
        payment_method: 'cash',
        payer_name: bill.payer?.name
      } satisfies Bill));
    } catch (error) {
      console.error('❌ Error in fetchBills:', error);
      return [];
    }
  };

  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: fetchBills,
    enabled: !!session?.user?.id && !!sourceId && sourceId !== 'all',
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { bills, queryClient, isLoading, error };
}
