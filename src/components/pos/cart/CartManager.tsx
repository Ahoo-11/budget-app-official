import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { toast } from "sonner";

interface CartManagerProps {
  sourceId: string;
  selectedProducts: BillProduct[];
  setSelectedProducts: (products: BillProduct[]) => void;
  paymentMethod: 'cash' | 'transfer';
}

export const useCartManager = ({
  sourceId,
  selectedProducts,
  setSelectedProducts,
  paymentMethod
}: CartManagerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (
    subtotal: number,
    discount: number,
    gstAmount: number,
    finalTotal: number,
  ) => {
    if (!sourceId || selectedProducts.length === 0) {
      toast.error("No items in cart");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

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
          status: 'paid',
          date: new Date().toISOString(),
          session_id: activeSession.id,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (billError) throw billError;

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