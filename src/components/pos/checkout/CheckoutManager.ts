import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bill";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useCheckoutManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCheckout = async (
    billId: string,
    items: BillProduct[],
    payerId: string | null = null
  ) => {
    console.log('🚀 Starting checkout process:', { billId, items, payerId });
    
    if (!billId || items.length === 0) {
      console.error('❌ Checkout failed: No items or invalid bill ID');
      toast({
        title: "Error",
        description: "No items selected for checkout",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Checkout failed: User not authenticated');
        throw new Error("User not authenticated");
      }

      // First, get the bill to check its current status and source_id
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .select('status, source_id')
        .eq('id', billId)
        .single();

      if (billError || !bill) {
        console.error('❌ Error fetching bill:', billError);
        throw billError || new Error('Bill not found');
      }

      if (bill.status === 'completed') {
        console.log('⚠️ Bill is already completed');
        return true;
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstRate = 0.08; // 8% GST
      const gstAmount = subtotal * gstRate;
      const total = subtotal + gstAmount;

      console.log('💰 Calculated totals:', { subtotal, gstAmount, total });

      // Prepare items for storage
      const serializedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        source_id: item.source_id,
        category: item.category,
        image_url: item.image_url,
        description: item.description
      }));

      // Update bill status to completed
      const { error: updateError } = await supabase
        .from('bills')
        .update({
          status: 'completed',
          items: serializedItems,
          subtotal,
          gst: gstAmount,
          total,
          payer_id: payerId,
          paid_amount: total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', billId)
        .eq('status', 'active');

      if (updateError) {
        console.error('❌ Error updating bill:', updateError);
        throw new Error(`Failed to update bill status: ${updateError.message}`);
      }

      // Update queries after successful checkout
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] })
      ]);

      console.log('🔄 Queries invalidated and refetched');

      toast({
        title: "Success",
        description: "Bill has been completed successfully",
      });

      return true;
    } catch (error) {
      console.error('❌ Error in checkout process:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete checkout",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleCheckout
  };
};