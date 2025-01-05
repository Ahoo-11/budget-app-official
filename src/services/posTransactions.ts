import { Bill, BillProduct } from '@/types/bills';
import { supabase } from '@/integrations/supabase/client';

export const createTransaction = async (transactionData: any) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTransactionsByBillId = async (billId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('bill_id', billId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateTransaction = async (transactionId: string, updates: any) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteTransaction = async (transactionId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getAllTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const mapBillToTransaction = (bill: Bill): any => {
  return {
    bill_id: bill.id,
    total: bill.total,
    payer_id: bill.payer_id,
    status: bill.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const createBillTransaction = async (bill: Bill) => {
  const transactionData = mapBillToTransaction(bill);
  return await createTransaction(transactionData);
};
