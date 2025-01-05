export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type?: 'product' | 'service';
  source_id?: string;
  category?: string | null;
  image_url?: string | null;
  description?: string | null;
  current_stock: number;
  purchase_cost: number | null;
  income_type_id?: string | null;
}

export interface BillItemJson {
  id: string;
  name: string;
  price: number | string;
  quantity: number | string;
  type?: 'product' | 'service';
  source_id?: string;
  category?: string | null;
  image_url?: string | null;
  description?: string | null;
  income_type_id?: string | null;
}

export type BillStatus = 'active' | 'completed' | 'partially_paid' | 'pending' | 'overdue';

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
  income_type_id?: string | null;
}