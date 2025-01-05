import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";
import { toast } from "sonner";

export const useBillManager = (sourceId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBill = async (items: BillProduct[]) => {
    try {
      setIsSubmitting(true);

      const { data: bill, error } = await supabase
        .from("bills")
        .insert({
          source_id: sourceId,
          items,
          status: "pending",
          total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        })
        .select()
        .single();

      if (error) {
        toast.error("Error creating bill");
        throw error;
      }

      toast.success("Bill created successfully");
      return bill;
    } catch (error) {
      console.error("Error in createBill:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createBill,
    isSubmitting,
  };
};