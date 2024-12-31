import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill } from "@/types/bill";
import { useBillProducts } from "./bills/useBillProducts";
import { useBillStatus } from "./bills/useBillStatus";
import { useBillSwitching } from "./bills/useBillSwitching";

export const useBillManagement = (sourceId: string) => {
  const queryClient = useQueryClient();
  const { selectedProducts, setSelectedProducts, handleProductSelect } = useBillProducts();
  const { isSubmitting, handleUpdateBillStatus } = useBillStatus();
  const { activeBillId, handleNewBill, handleSwitchBill } = useBillSwitching(
    sourceId,
    setSelectedProducts,
    handleUpdateBillStatus
  );

  const { data: bills = [] } = useQuery({
    queryKey: ['bills', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .in('status', ['active', 'on-hold'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(bill => ({
        ...bill,
        items: Array.isArray(bill.items) 
          ? bill.items.map(item => ({
              id: item.id,
              name: item.name,
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 0,
              type: item.type,
              source_id: item.source_id,
              category: item.category,
              image_url: item.image_url,
              description: item.description,
            }))
          : [],
        status: bill.status as 'active' | 'on-hold' | 'completed'
      })) as Bill[];
    },
    refetchInterval: 5000 // Refresh every 5 seconds to keep bills in sync
  });

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
    refetchBills: () => queryClient.invalidateQueries({ queryKey: ['bills', sourceId] })
  };
};