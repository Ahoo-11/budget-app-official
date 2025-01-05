import { supabase } from "@/integrations/supabase/client";
import { BillProduct } from "@/types/bill";
import { PosTransaction } from "@/types/pos-transaction";

export const createPosTransaction = async (
  sourceId: string,
  userId: string,
  items: BillProduct[],
  subtotal: number,
  discount: number,
  gst: number,
  total: number,
  paidAmount: number,
  payerId: string | null = null,
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      source_id: sourceId,
      user_id: userId,
      type: 'pos_sale',
      description: 'POS Sale',
      items: items,
      amount: total,
      paid_amount: paidAmount,
      status: 'active',
      date: new Date().toISOString(),
      payer_id: payerId,
      subtotal,
      discount,
      gst,
      total,
      created_by_name: 'POS System'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completePosTransaction = async (
  transactionId: string,
  paidAmount: number
) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      paid_amount: paidAmount,
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchActivePosTransactions = async (sourceId: string): Promise<PosTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('source_id', sourceId)
    .eq('type', 'pos_sale')
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as PosTransaction[];
};