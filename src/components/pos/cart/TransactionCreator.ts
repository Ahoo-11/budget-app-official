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
  console.log('Creating transaction with:', {
    sourceId,
    userId,
    paidAmount,
    totalAmount,
    payerId,
    date,
    items
  });

  // Always create a transaction record for bill tracking
  const { data, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      source_id: sourceId,
      user_id: userId,
      type: 'income',
      amount: totalAmount, // Use total amount for transaction visibility
      description: `POS Sale${paidAmount > 0 ? ' - Payment' : ' - Pending'}`,
      date: date.toISOString(),
      payer_id: payerId,
      status: paidAmount >= totalAmount ? 'completed' : 'pending',
      created_by_name: 'POS System'
    })
    .select();

  console.log('Transaction creation result:', { data, error: transactionError });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
    throw transactionError;
  }

  return data;
};