import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct } from "@/types/bills";

export const useBillUpdates = (billId: string) => {
  const { data: bill, error, isLoading } = useQuery<Bill | null>({
    queryKey: ['bill', billId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (error) throw error;
      return data as Bill;
    },
    enabled: !!billId,
  });

  const updateBill = async (updatedBill: Partial<Bill>) => {
    const { error } = await supabase
      .from('bills')
      .update(updatedBill)
      .eq('id', billId);

    if (error) throw error;
  };

  return {
    bill,
    error,
    isLoading,
    updateBill,
  };
};
