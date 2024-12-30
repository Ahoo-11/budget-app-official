import { Product } from "./product";

// Type for bill items that can be serialized to JSON
export interface BillItemJson {
  id: string;
  name: string;
  price: number;
  quantity: number;
  source_id: string;
  category?: string;
  image_url?: string;
  description?: string;
}

// Type for working with bill items in the application
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