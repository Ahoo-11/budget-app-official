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
  // Always create a transaction record for bill tracking
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      source_id: sourceId,
      type: 'income',
      amount: totalAmount, // Use total amount for transaction visibility
      description: `POS Sale${paidAmount > 0 ? ' - Payment' : ' - Pending'}`,
      date: date.toISOString(),
      user_id: userId,
      payer_id: payerId,
      status: paidAmount >= totalAmount ? 'completed' : 'pending',
      created_by_name: 'POS System'
    });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw transactionError;
  }
};