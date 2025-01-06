import { Json } from "@/integrations/supabase/types";

export type BillStatus = "active" | "pending" | "partially_paid" | "paid" | "cancelled";

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
  description?: string;
  image_url?: string | null;
  income_type_id?: string | null;
}

export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: BillStatus;
  items: BillProduct[];
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
}

// Helper functions for JSON serialization
export const serializeBillItems = (items: BillProduct[]): Json => {
  return items.map(item => ({
    ...item,
    type: item.type || 'product',
    current_stock: item.current_stock || 0,
    purchase_cost: item.purchase_cost || null
  }));
};

export const deserializeBillItems = (json: Json): BillProduct[] => {
  if (!Array.isArray(json)) return [];
  
  return json.map(item => ({
    id: String(item.id || ''),
    name: String(item.name || ''),
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    type: (item.type as "product" | "service") || "product",
    source_id: String(item.source_id || ''),
    current_stock: Number(item.current_stock || 0),
    purchase_cost: item.purchase_cost ? Number(item.purchase_cost) : null,
    category: item.category ? String(item.category) : undefined,
    description: item.description ? String(item.description) : undefined,
    image_url: item.image_url ? String(item.image_url) : null,
    income_type_id: item.income_type_id ? String(item.income_type_id) : null
  }));
};