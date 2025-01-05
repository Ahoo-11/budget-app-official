import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";

export function useCartCalculations(sourceId: string | null) {
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems', sourceId],
    queryFn: async () => {
      if (!sourceId) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('source_id', sourceId);

      if (error) throw error;
      return data as BillProduct[];
    },
    enabled: !!sourceId,
  });

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    cartItems,
    totalAmount,
  };
}
