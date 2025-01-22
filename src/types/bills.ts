import { Json } from "@/integrations/supabase/types";

export type BillStatus = "active" | "pending" | "partially_paid" | "paid" | "cancelled" | "completed";
export type PaymentMethod = 'cash' | 'transfer';

export interface BillProduct {
  id: string;
  type: "product" | "service" | "consignment";
  name: string;
  price: number;
  quantity: number;
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

export interface BillItemJson {
  id: string;
  type: "product" | "service" | "consignment";
  name: string;
  price: number;
  quantity: number;
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
    id: item.id as string,
    type: item.type as "product" | "service" | "consignment",
    name: item.name as string,
    price: item.price as number,
    quantity: item.quantity as number,
    measurement_unit: item.measurement_unit as {
      id: string;
      name: string;
      symbol: string;
    } | undefined,
    source_id: item.source_id as string,
    current_stock: item.current_stock as number,
    purchase_cost: item.purchase_cost as number | null,
    category: item.category as string | undefined,
    description: item.description as string | null | undefined,
    image_url: item.image_url as string | null | undefined,
    income_type_id: item.income_type_id as string | null | undefined,
    measurement_unit_id: item.measurement_unit_id as string | undefined,
  }));
};