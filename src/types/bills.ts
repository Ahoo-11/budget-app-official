import { Database } from './supabase';

export type BillStatus = Database['public']['Tables']['bills']['Row']['status'];

export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  source_id: string;
  category?: string;
  image_url?: string | null;
  description?: string | null;
  current_stock: number;
  purchase_cost: number | null;
  income_type_id?: string | null;
}

// This is what we store in the database
export type BillItemJson = BillProduct;

// Type for creating a new bill
export type NewBillInput = Database['public']['Tables']['bills']['Insert'];

// Type for a bill as stored in the database
export type BillRow = Database['public']['Tables']['bills']['Row'];

// Type for a bill after being fetched and processed
export interface Bill extends Omit<BillRow, 'items'> {
  items: BillItemJson[];
  payer_name?: string;
}
