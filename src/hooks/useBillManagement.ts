import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillItemJson } from "@/types/bill";
import { useBillProducts } from "./bills/useBillProducts";
import { useBillStatus } from "./bills/useBillStatus";
import { useBillSwitching } from "./bills/useBillSwitching";
import { useEffect, useCallback } from "react";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export function useBillManagement(sourceId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedProducts, setSelectedProducts, handleProductSelect } = useBillProducts();
  const { isSubmitting, handleUpdateBillStatus } = useBillStatus();
  const { activeBillId, handleNewBill, handleSwitchBill } = useBillSwitching(
    sourceId,
    setSelectedProducts,
    handleUpdateBillStatus
  );

  console.log('🔄 useBillManagement - sourceId:', sourceId);
  console.log('📄 useBillManagement - activeBillId:', activeBillId);

  const fetchBills = useCallback(async () => {
    console.log('🔍 Fetching bills for source:', sourceId);
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'pending', 'partially_paid'])
        .order('created_at', { ascending: false });
      
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
        items: Array.isArray(bill.items) 
          ? (bill.items as unknown[] as BillItemJson[]).map(item => ({
              id: item.id,
              name: item.name,
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 0,
              type: item.type,
              source_id: item.source_id,
              category: item.category,
              image_url: item.image_url,
              description: item.description,
              income_type_id: item.income_type_id,
              current_stock: 0,
              purchase_cost: null
            }))
          : [],
        status: bill.status
      })) as Bill[];
    } catch (error) {
      console.error('❌ Error in fetchBills:', error);
      return [];
    }
  }, [sourceId, toast]);

  const { data: bills = [] } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: fetchBills,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(async (payload: RealtimePostgresChangesPayload<any>) => {
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
    }
  }, [sourceId, queryClient, activeBillId, setSelectedProducts, toast]);

  // Set up real-time subscription for bill updates
  useEffect(() => {
    console.log('🔌 Setting up real-time subscription for bills...');
    const channel = supabase
      .channel(`bills-${sourceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `source_id=eq.${sourceId}`
        },
        handleRealtimeUpdate
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up bills subscription');
      channel.unsubscribe();
    };
  }, [sourceId, handleRealtimeUpdate]);

  return {
    bills,
    activeBillId,
    selectedProducts,
    isSubmitting,
    setSelectedProducts,
    handleNewBill,
    handleSwitchBill,
    handleProductSelect,
    handleUpdateBillStatus,
    refetchBills: fetchBills
  };
}