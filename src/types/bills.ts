import { Json } from "@/integrations/supabase/types";

export type BillStatus = "active" | "pending" | "partially_paid" | "paid" | "cancelled" | "completed";

export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "product" | "service";
  source_id: string;
  current_stock: number;
  purchase_cost: number | null;
  category?: string;
  description?: string | null;
  image_url?: string | null;
  income_type_id?: string | null;
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface BillDBRow {
  id: string;
  source_id: string;
  user_id: string;
  status: BillStatus;
  items: Json;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  date: string;
  created_at: string;
  updated_at: string;
  payer_id?: string | null;
  type_id?: string | null;
  paid_amount: number;
  payment_method: 'cash' | 'transfer';
}

export interface Bill extends Omit<BillDBRow, 'items'> {
  items: BillProduct[];
  payer_name?: string;
}

export const serializeBillItems = (items: BillProduct[]): Json => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    source_id: item.source_id,
    current_stock: item.current_stock,
    purchase_cost: item.purchase_cost,
    category: item.category,
    description: item.description,
    image_url: item.image_url,
    income_type_id: item.income_type_id,
    measurement_unit_id: item.measurement_unit_id,
    measurement_unit: item.measurement_unit
  })) as Json;
};

export const deserializeBillItems = (json: Json): BillProduct[] => {
  if (!json || !Array.isArray(json)) return [];

  return json.map(item => {
    if (typeof item !== 'object' || !item) return {} as BillProduct;
    
    const typedItem = item as Record<string, Json>;
    
    return {
      id: String(typedItem.id || ''),
      name: String(typedItem.name || ''),
      price: Number(typedItem.price || 0),
      quantity: Number(typedItem.quantity || 0),
      type: (String(typedItem.type || 'product')) as "product" | "service",
      source_id: String(typedItem.source_id || ''),
      current_stock: Number(typedItem.current_stock || 0),
      purchase_cost: typedItem.purchase_cost ? Number(typedItem.purchase_cost) : null,
      category: typedItem.category ? String(typedItem.category) : undefined,
      description: typedItem.description ? String(typedItem.description) : null,
      image_url: typedItem.image_url ? String(typedItem.image_url) : null,
      income_type_id: typedItem.income_type_id ? String(typedItem.income_type_id) : null,
      measurement_unit_id: typedItem.measurement_unit_id ? String(typedItem.measurement_unit_id) : undefined,
      measurement_unit: typedItem.measurement_unit as BillProduct['measurement_unit']
    };
  });
};