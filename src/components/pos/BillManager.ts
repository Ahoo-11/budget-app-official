import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, BillItemJson } from "@/types/bill";
import { Json } from "@/integrations/supabase/types";

const isBillItemJson = (item: Json): item is BillItemJson => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'price' in item &&
    'quantity' in item
  );
};

export const serializeBillItems = (items: BillProduct[]): BillItemJson[] => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url,
    description: item.description,
  }));
};

export const deserializeBillItems = (items: Json): BillProduct[] => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(isBillItemJson).map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    type: item.type || 'product',
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
    .in('status', ['active'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(bill => ({
    ...bill,
    items: deserializeBillItems(bill.items),
    status: bill.status as 'active' | 'completed'
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
  const serializedItems = serializeBillItems(items).map(item => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  const { error } = await supabase
    .from('bills')
    .update({
      items: serializedItems,
      status: 'completed',
    })
    .eq('id', billId);

  if (error) throw error;
};