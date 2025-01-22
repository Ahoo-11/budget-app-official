import { Json } from "@/integrations/supabase/types";
import { Product } from "./product";
import { Service } from "./service";

export type BillStatus = "active" | "pending" | "partially_paid" | "paid" | "cancelled" | "completed";

export interface BillProduct extends Product {
  quantity: number;
}

export interface BillService extends Service {
  quantity: number;
}

export interface BillItemJson {
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

export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: BillStatus;
  items: BillItemJson[];
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