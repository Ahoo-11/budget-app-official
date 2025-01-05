import { Bill } from "@/types/bills";
import { supabase } from "@/integrations/supabase/client";

export const createTransaction = async (bill: Bill) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          source_id: bill.source_id,
          description: `Bill #${bill.id}`,
          amount: bill.total,
          type: 'pos_sale',
          payer_id: bill.payer_id,
          date: bill.date,
          status: 'pending',
          total_amount: bill.total,
          paid_amount: bill.paid_amount,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};