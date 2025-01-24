import { Json } from "@/integrations/supabase/types";

export type BillStatus = "active" | "pending" | "partially_paid" | "paid" | "cancelled" | "completed";
export type PaymentMethod = 'cash' | 'transfer';

export interface BillProduct {
  id: string;
  type: "product" | "service" | "consignment";
  name: string;
  price: number;
  quantity: number;
  unit_price?: number;
  product_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  source_id: string;
  current_stock: number;
  purchase_cost: number | null;
  category?: string;
  description?: string | null;
  image_url?: string | null;
  income_type_id?: string | null;
  measurement_unit_id?: string;
  product_type?: 'basic' | 'composite';
}

export interface BillDBRow {
  id: string;
  source_id: string;
  user_id: string;
  date: string;
  created_at: string;
  items: Json;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
  status: BillStatus;
  session_id?: string | null;
  payer_id?: string | null;
  type_id?: string | null;
  paid_amount: number;
  payment_method: PaymentMethod;
}

export interface Bill extends Omit<BillDBRow, 'items'> {
  items: BillProduct[];
  payer_name?: string;
}

export interface BillItem {
  bill_id: string;
  item_id: string;
  item_type: "product" | "service" | "consignment";
  quantity: number;
  price: number;
  total: number;
}

export const serializeBillItems = (items: BillProduct[]): Json => {
  return items.map(item => ({
    id: item.id,
    type: item.type,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    measurement_unit: item.measurement_unit,
    source_id: item.source_id,
    current_stock: item.current_stock,
    purchase_cost: item.purchase_cost,
    category: item.category,
    description: item.description,
    image_url: item.image_url,
    income_type_id: item.income_type_id,
    measurement_unit_id: item.measurement_unit_id,
  })) as Json;
};

export const deserializeBillItems = (json: Json): BillProduct[] => {
  if (!Array.isArray(json)) return [];

  return json.map(item => ({
    id: String(item.id || ''),
    type: String(item.type || 'product') as "product" | "service" | "consignment",
    name: String(item.name || ''),
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    measurement_unit: item.measurement_unit as {
      id: string;
      name: string;
      symbol: string;
    } | undefined,
    source_id: String(item.source_id || ''),
    current_stock: Number(item.current_stock || 0),
    purchase_cost: item.purchase_cost ? Number(item.purchase_cost) : null,
    category: item.category ? String(item.category) : undefined,
    description: item.description ? String(item.description) : null,
    image_url: item.image_url ? String(item.image_url) : null,
    income_type_id: item.income_type_id ? String(item.income_type_id) : null,
    measurement_unit_id: item.measurement_unit_id ? String(item.measurement_unit_id) : undefined,
  }));
};