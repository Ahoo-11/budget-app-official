import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { toast } from "sonner";

interface CartManagerProps {
  sourceId: string;
  selectedProducts: BillProduct[];
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const useCartManager = ({
  sourceId,
  selectedProducts,
  setSelectedProducts
}: CartManagerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (
    subtotal: number,
    discount: number,
    gstAmount: number,
    finalTotal: number,
    paidAmount: number = 0
  ) => {
    if (!sourceId || selectedProducts.length === 0) {
      toast.error("No items in cart");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check for active session
      const { data: activeSession } = await supabase
        .from('sessions')
        .select('id')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (!activeSession?.id) {
        toast.error("No active session found. Please start a new session before creating bills.");
        return;
      }

      // Create bill first
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: user.id,
          items: serializeBillItems(selectedProducts),
          subtotal: subtotal,
          discount: discount,
          gst: gstAmount,
          total: finalTotal,
          paid_amount: paidAmount,
          status: paidAmount >= finalTotal ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'pending',
          date: new Date().toISOString(),
          session_id: activeSession.id
        })
        .select()
        .single();

      if (billError) throw billError;

      // Create stock movements for products
      const stockMovements = selectedProducts
        .filter(item => item.type === 'product')
        .map(product => ({
          product_id: product.id,
          movement_type: 'sale',
          quantity: -product.quantity,
          unit_cost: product.purchase_cost || 0,
          notes: `Bill: ${bill.id}`,
          created_by: user.id
        }));

      if (stockMovements.length > 0) {
        const { error: stockError } = await supabase
          .from('stock_movements')
          .insert(stockMovements);

        if (stockError) throw stockError;

        // Update product stock levels
        for (const product of selectedProducts.filter(item => item.type === 'product')) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              current_stock: product.current_stock - product.quantity
            })
            .eq('id', product.id);

          if (updateError) throw updateError;
        }
      }

      // Clear cart and show success message
      setSelectedProducts([]);
      toast.success("Bill created successfully and stock updated");

    } catch (error: any) {
      console.error('Error creating bill:', error);
      toast.error(error.message || "Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBill = () => {
    setSelectedProducts([]);
    toast.info("Bill cancelled");
  };

  return {
    handleCheckout,
    handleCancelBill,
    isSubmitting
  };
};