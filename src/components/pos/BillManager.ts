import { supabase } from "@/integrations/supabase/client";
import { Bill, BillItem, BillItemJson } from "@/types/bill";

export const serializeBillItems = (items: BillItem[]): BillItemJson[] => {
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

export const deserializeBillItems = (items: BillItemJson[]): BillItem[] => {
  return items.map(item => ({
    ...item,
    quantity: item.quantity || 0,
    purchase_cost: null,
    minimum_stock_level: 0,
    current_stock: 0,
    supplier_id: null,
    storage_location: null,
    unit_of_measurement: null,
    subcategory: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

export const fetchActiveBills = async (sourceId: string) => {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('source_id', sourceId)
    .in('status', ['active', 'on-hold'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(bill => ({
    ...bill,
    items: deserializeBillItems(bill.items as BillItemJson[])
  })) as Bill[];
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

export const updateBillItems = async (billId: string, items: BillItem[]) => {
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