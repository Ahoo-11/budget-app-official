import { Product } from "./product";

// Type for bill items that can be serialized to JSON
export interface BillItemJson {
  [key: string]: string | number | null;
  id: string;
  name: string;
  price: number;
  quantity: number;
  source_id: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
}

// Type for working with bill items in the application
export interface BillItem extends Omit<Product, 'quantity'> {
  quantity: number;
  [key: string]: any; // Add index signature to make it compatible with Json type
}

export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: 'active' | 'on-hold' | 'completed' | string; // Allow string to handle unknown statuses
  customer_id?: string | null;
  items: BillItemJson[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  date: string;
  created_at: string;
  updated_at: string;
}