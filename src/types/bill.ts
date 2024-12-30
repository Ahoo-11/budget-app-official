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

// Specific type for bill items that includes only necessary product fields
export type BillProduct = Pick<Product, 
  | 'id' 
  | 'name' 
  | 'price' 
  | 'source_id' 
  | 'category' 
  | 'image_url' 
  | 'description'
  | 'current_stock'
  | 'purchase_cost'
> & {
  quantity: number;
};

export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: 'active' | 'on-hold' | 'completed' | string;
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