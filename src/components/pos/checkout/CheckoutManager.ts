import { Bill } from "@/types/bills";
import { supabase } from "@/integrations/supabase/client";
import { createTransaction } from "../cart/TransactionCreator";

export const handleCheckout = async (bill: Bill) => {
  try {
    // Update bill status
    const { error: billError } = await supabase
      .from('bills')
      .update({ 
        status: 'paid',
        paid_amount: bill.total 
      })
      .eq('id', bill.id);

    if (billError) throw billError;

    // Create transaction
    await createTransaction(bill);

    return true;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};