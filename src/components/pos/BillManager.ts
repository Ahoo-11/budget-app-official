import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, BillItemJson } from "@/types/bill";

export const serializeBillItems = (items: BillProduct[]): BillItemJson[] => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url,
    description: item.description,
  }));
};

export const deserializeBillItems = (items: BillItemJson[]): BillProduct[] => {
  return items.map((item: BillItemJson) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url,
    description: item.description,
    current_stock: 0,
    purchase_cost: null,
  }));
};

export const fetchActiveBills = async (sourceId: string): Promise<Bill[]> => {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('source_id', sourceId)
    .in('status', ['active', 'on-hold'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(bill => ({
    ...bill,
    items: Array.isArray(bill.items) ? bill.items as BillItemJson[] : [],
  }));
};

export const createNewBill = async (sourceId: string, userId: string) => {
  const { data, error } = await supabase
    .from('bills')
    .insert({
      source_id: sourceId,
      user_id: userId,
      status: 'active',
      items: [],
      subtotal: 0,
      total: 0,
      gst: 0,
      discount: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBillItems = async (billId: string, items: BillProduct[]) => {
  const serializedItems = serializeBillItems(items);
  const { error } = await supabase
    .from('bills')
    .update({
      items: serializedItems,
      status: 'completed',
    })
    .eq('id', billId);

  if (error) throw error;
};