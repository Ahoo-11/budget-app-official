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

      // Start a transaction block
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          source_id: bill.source_id,
          type: 'income',
          amount: total,
          description: `POS Sale - Bill #${billId}`,
          date: new Date().toISOString(),
          user_id: user.id,
          payer_id: payerId,
          created_by_name: user.email,
          status: 'completed'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Error creating transaction:', transactionError);
        throw transactionError;
      }

      console.log('✅ Transaction created:', transaction);

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', billId)
        .eq('status', 'active'); // Only update if status is still active

      if (updateError) {
        console.error('❌ Error updating bill:', updateError);
        throw updateError;
      }

      // Verify bill status after update
      const { data: verifyBill, error: verifyError } = await supabase
        .from('bills')
        .select('status')
        .eq('id', billId)
        .single();
        
      if (verifyError || !verifyBill) {
        console.error('⚠️ Error verifying bill status:', verifyError);
        throw verifyError || new Error('Could not verify bill status');
      }

      if (verifyBill.status !== 'completed') {
        console.error('❌ Bill status not updated correctly:', verifyBill);
        throw new Error('Bill status not updated to completed');
      }

      console.log('✅ Bill status verified as completed');

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

      // Force refresh queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      ]);

      console.log('🔄 Queries invalidated and refetched');

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