import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bills";
import { toast } from "sonner";

export const createTransaction = async (
  sourceId: string,
  items: BillProduct[],
  payerId?: string
) => {
  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        source_id: sourceId,
        payer_id: payerId,
        type: "pos_sale",
        amount: total,
        description: `POS Sale - ${items.length} items`,
        status: "pending",
        total_amount: total,
        remaining_amount: total,
      })
      .select()
      .single();

    if (error) {
      toast.error("Error creating transaction");
      throw error;
    }

    return transaction;
  } catch (error) {
    console.error("Error in createTransaction:", error);
    throw error;
  }
};