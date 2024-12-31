import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, BillItemJson } from "@/types/bill";
import { Json } from "@/integrations/supabase/types";

// Helper function to check if a value is a non-null object
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

// Type guard for bill items
const isValidBillItem = (item: Record<string, unknown>): item is BillItemJson => {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    (typeof item.price === 'number' || typeof item.price === 'string') &&
    (typeof item.quantity === 'number' || typeof item.quantity === 'string')
  );
};

export const serializeBillItems = (items: BillProduct[]): Record<string, unknown>[] => {
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
  
  return items
    .filter(isObject)
    .filter(isValidBillItem)
    .map(item => ({
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      type: item.type as 'product' | 'service' | undefined,
      source_id: item.source_id as string | undefined,
      category: item.category as string | null | undefined,
      image_url: item.image_url as string | null | undefined,
      description: item.description as string | null | undefined,
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