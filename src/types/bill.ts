import { Product } from "./product";

export interface BillItem extends Product {
  quantity: number;
}

export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: 'active' | 'on-hold' | 'completed';
  customer_id?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  date: string;
  created_at: string;
  updated_at: string;
}