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

      console.log('📝 Updating bill status to completed...');

      // Update bill status and totals
      const { error: billError, data: updatedBill } = await supabase
        .from('bills')
        .update({
          status: 'completed',
          items: serializedItems,
          subtotal,
          gst: gstAmount,
          total,
          payer_id: payerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', billId)
        .select()
        .single();

      if (billError) {
        console.error('❌ Error updating bill:', billError);
        throw billError;
      }

      console.log('✅ Bill updated successfully:', updatedBill);

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          source_id: updatedBill.source_id,
          type: 'income',
          amount: total,
          description: `POS Sale - Bill #${billId}`,
          date: new Date().toISOString(),
          user_id: user.id,
          payer_id: payerId,
          created_by_name: user.email
        });

      if (transactionError) throw transactionError;

      // Update product stock levels and create stock movements for products only
      for (const item of items) {
        if (item.type === 'product' && item.current_stock !== undefined) {
          const newStock = item.current_stock - item.quantity;
          
          // Update product stock
          const { error: stockError } = await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.id);

          if (stockError) throw stockError;

          // Create stock movement
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

          if (movementError) {
            console.error('Stock movement error:', movementError);
            throw movementError;
          }
        }
      }

      // Verify bill status after update
      const { data: verifyBill, error: verifyError } = await supabase
        .from('bills')
        .select('status')
        .eq('id', billId)
        .single();
        
      console.log('🔍 Final bill status verification:', verifyBill);

      if (verifyError) {
        console.error('⚠️ Error verifying bill status:', verifyError);
      }

      // Refresh queries
      console.log('🔄 Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast({
        title: "Success",
        description: "Checkout completed successfully",
      });

      return true;
    } catch (error) {
      console.error('❌ Checkout error:', error);
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
