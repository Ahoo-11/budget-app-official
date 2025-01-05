import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Bill, BillItemJson, BillProduct, BillRow } from "@/types/bills";
import { useBillProducts } from "./bills/useBillProducts";
import { useBillStatus } from "./bills/useBillStatus";
import { useBillSwitching } from "./bills/useBillSwitching";
import { useSession } from "@supabase/auth-helpers-react";

export function useBillManagement(sourceId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useSession();
  const { selectedProducts, setSelectedProducts, handleProductSelect } = useBillProducts();
  const { isSubmitting, handleUpdateBillStatus } = useBillStatus();
  const { activeBillId, handleNewBill, handleSwitchBill } = useBillSwitching(
    sourceId,
    setSelectedProducts,
    handleUpdateBillStatus
  );

  console.log('🔄 useBillManagement - sourceId:', sourceId);
  console.log('🔄 useBillManagement - userId:', session?.user?.id);
  console.log('📄 useBillManagement - activeBillId:', activeBillId);

  const fetchBills = useCallback(async () => {
    console.log('🔍 Fetching bills for source:', sourceId);
    try {
      if (!session?.user?.id) {
        console.log('No user session, skipping bill fetch');
        return [];
      }

      let query = supabase
        .from('bills')
        .select('*, payers(name)')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'completed'] as const)
        .order('created_at', { ascending: false });
      
      // Only filter by source_id if one is provided and not 'all'
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
  }, [sourceId, session?.user?.id, toast]);

  const { data: bills = [] } = useQuery({
    queryKey: ['bills', sourceId, session?.user?.id],
    queryFn: fetchBills,
    enabled: !!session?.user?.id,  // Only run query if we have a user
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(async (payload: RealtimePostgresChangesPayload<BillRow>) => {
    console.log('🔄 Real-time bill update:', payload);
    
    // Force refetch bills on any change
    queryClient.invalidateQueries({ queryKey: ['bills', sourceId] });
    
    // If the active bill was deleted, clear selected products
    if (payload.eventType === 'DELETE' && payload.old?.id === activeBillId) {
      setSelectedProducts([]);
    }

    // Show toast notification for bill updates
    if (payload.eventType === 'INSERT') {
      toast({
        title: "New bill created",
        description: "A new bill has been created successfully.",
      });
    } else if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
      toast({
        title: "Bill completed",
        description: "The bill has been marked as completed.",
      });
    }
  }, [activeBillId, queryClient, setSelectedProducts, sourceId, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('bills-channel')
      .on<BillRow>(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: sourceId && sourceId !== 'all' 
            ? `source_id=eq.${sourceId} and user_id=eq.${session.user.id}`
            : `user_id=eq.${session.user.id}`
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sourceId, handleRealtimeUpdate, session?.user?.id]);

  return {
    bills,
    selectedProducts,
    setSelectedProducts,
    handleProductSelect,
    isSubmitting,
    handleUpdateBillStatus,
    activeBillId,
    handleNewBill,
    handleSwitchBill,
  };
}