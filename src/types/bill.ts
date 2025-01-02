export interface Bill {
  id: string;
  source_id: string;
  user_id: string;
  status: 'active' | 'on-hold' | 'completed';
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

export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  source_id: string;  // Changed from optional to required
  category: string | null;
  image_url: string | null;
  description: string | null;
  current_stock?: number;
  purchase_cost: number | null;
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
}