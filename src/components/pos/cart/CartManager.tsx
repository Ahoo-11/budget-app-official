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
      // Serialize items with proper error handling
      let serializedItems;
      try {
        serializedItems = serializeBillItems(selectedProducts);
      } catch (error) {
        console.error('Error serializing items:', error);
        toast.error("Error processing items");
        return;
      }

      const { data, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          items: serializedItems,
          subtotal: subtotal,
          discount: discount,
          gst: gstAmount,
          total: finalTotal,
          paid_amount: paidAmount,
          status: paidAmount >= finalTotal ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'pending',
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedProducts([]);
      toast.success("Bill created successfully");
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error("Failed to create bill");
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