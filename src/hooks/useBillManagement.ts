import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillItemJson } from "@/types/bill";
import { useBillProducts } from "./bills/useBillProducts";
import { useBillStatus } from "./bills/useBillStatus";
import { useBillSwitching } from "./bills/useBillSwitching";
import { useEffect, useCallback } from "react";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const useBillManagement = (sourceId: string) => {
  const queryClient = useQueryClient();
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
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('source_id', sourceId)
      .eq('status', 'active')  // Only fetch active bills
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching bills:', error);
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
            current_stock: 0, // Default value for current_stock
            purchase_cost: null // Default value for purchase_cost
          }))
        : [],
      status: bill.status as 'active' | 'completed'
    })) as Bill[];
  }, [sourceId]);

  const { data: bills = [] } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: fetchBills,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(async (payload: RealtimePostgresChangesPayload<any>) => {
    console.log('🔄 Real-time bill update:', payload);
    
    // Force refetch bills on any change
    const updatedBills = await fetchBills();
    queryClient.setQueryData(['bills', sourceId], updatedBills);
    
    // If the active bill was deleted, clear selected products
    if (payload.eventType === 'DELETE' && payload.old?.id === activeBillId) {
      setSelectedProducts([]);
    }
  }, [sourceId, queryClient, fetchBills, activeBillId, setSelectedProducts]);

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
};