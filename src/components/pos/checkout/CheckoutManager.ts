import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct } from "@/types/bill";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useCheckoutManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCheckout = async (
    billId: string,
    items: BillProduct[],
    customerId: string | null = null
  ) => {
    if (!billId || items.length === 0) {
      toast({
        title: "Error",
        description: "No items selected for checkout",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Starting checkout:', { billId, items, customerId });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstRate = 0.08; // 8% GST
      const gstAmount = subtotal * gstRate;
      const total = subtotal + gstAmount;

      // Update bill status and totals
      const { error: billError } = await supabase
        .from('bills')
        .update({
          status: 'completed',
          items: items,
          subtotal,
          gst: gstAmount,
          total,
          customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', billId);

      if (billError) throw billError;

      // Update product stock levels and create stock movements
      for (const item of items) {
        const newStock = (item.current_stock || 0) - item.quantity;
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ current_stock: newStock })
          .eq('id', item.id);

        if (stockError) throw stockError;

        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: item.id,
            movement_type: 'sale',
            quantity: -item.quantity,
            unit_cost: item.price,
            notes: `Sale from bill ${billId}`,
            created_by: user.id
          });

        if (movementError) throw movementError;
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Success",
        description: "Checkout completed successfully",
      });

      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to complete checkout",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleCheckout };
};