import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillItemJson } from "@/types/bills";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

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
        .from('bills')
        .select('*, payers(name)')
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
      
      return (data || []).map(bill => ({
        ...bill,
        payer_name: bill.payers?.name,
        items: Array.isArray(bill.items) 
          ? (bill.items as any[]).map(item => ({
              id: item.id || '',
              name: item.name || '',
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 0,
              type: item.type || '',
              source_id: item.source_id || '',
              category: item.category || '',
              image_url: item.image_url || null,
              description: item.description || null,
              current_stock: Number(item.current_stock) || 0,
              purchase_cost: Number(item.purchase_cost) || null,
              income_type_id: item.income_type_id || null
            } as BillItemJson))
          : [],
        status: bill.status as Bill['status']
      })) as Bill[];
    } catch (error) {
      console.error('❌ Error in fetchBills:', error);
      return [];
    }
  };

  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: fetchBills,
    enabled: !!session?.user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { bills, queryClient, isLoading, error };
}