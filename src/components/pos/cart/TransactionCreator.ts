import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bill";

export const createBillTransaction = async (
  sourceId: string,
  userId: string,
  paidAmount: number,
  totalAmount: number,
  payerId: string | null,
  date: Date,
  items: BillProduct[]
) => {
  // Create the main transaction for the full bill amount
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      source_id: sourceId,
      user_id: userId,
      type: 'income',
      amount: totalAmount,
      description: `POS Sale - ${items.length} items`,
      date: date.toISOString(),
      payer_id: payerId,
      status: paidAmount >= totalAmount ? 'completed' : 'pending',
      created_by_name: 'POS System',
      total_amount: totalAmount,
      remaining_amount: totalAmount - paidAmount
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  // If there's a partial payment, create a payment transaction
  if (paidAmount > 0 && paidAmount < totalAmount) {
    const { error: paymentError } = await supabase
      .from('transactions')
      .insert({
        source_id: sourceId,
        user_id: userId,
        type: 'income',
        amount: paidAmount,
        description: `POS Sale Payment`,
        date: date.toISOString(),
        payer_id: payerId,
        status: 'completed',
        created_by_name: 'POS System',
        parent_transaction_id: data.id
      });

    if (paymentError) {
      console.error('Error creating payment transaction:', paymentError);
      throw paymentError;
    }
  }

  return data;
};