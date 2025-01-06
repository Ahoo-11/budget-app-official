import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { toast } from "sonner";

export const useCheckoutManager = (sourceId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCheckout = async (
    items: BillProduct[],
    payerId?: string,
    paidAmount: number = 0
  ) => {
    try {
      setIsProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: bill, error } = await supabase
        .from("bills")
        .insert({
          source_id: sourceId,
          user_id: user.id,
          payer_id: payerId,
          items: serializeBillItems(items),
          status: paidAmount >= total ? "paid" : "pending",
          total,
          paid_amount: paidAmount,
        })
        .select()
        .single();

      if (error) {
        toast.error("Error processing checkout");
        throw error;
      }

      toast.success("Checkout completed successfully");
      return bill;
    } catch (error) {
      console.error("Error in processCheckout:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing,
  };
};