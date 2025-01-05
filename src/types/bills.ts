import { Database } from '@/integrations/supabase/types';

export type BillStatus = 'active' | 'pending' | 'partially_paid' | 'paid';

export interface BillProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  source_id: string;
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
  price: number;
  quantity: number;
  type: 'product' | 'service';
  source_id: string;
  category?: string | null;
  image_url?: string | null;
  description?: string | null;
  current_stock: number;
  purchase_cost: number | null;
  income_type_id?: string | null;
}

export type NewBillInput = Database['public']['Tables']['bills']['Insert'];
export type BillRow = Database['public']['Tables']['bills']['Row'];

export interface Bill extends Omit<BillRow, 'items'> {
  items: BillProduct[];
  payer_name?: string;
}

// Helper functions for serialization
export const serializeBillItems = (items: BillProduct[]): Json => {
  return items.map(item => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity),
    current_stock: Number(item.current_stock),
    purchase_cost: item.purchase_cost ? Number(item.purchase_cost) : null
  })) as Json;
};

export const deserializeBillItems = (items: Json | null): BillProduct[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    id: String(item.id),
    name: String(item.name),
    price: Number(item.price),
    quantity: Number(item.quantity),
    type: item.type as 'product' | 'service',
    source_id: String(item.source_id),
    category: item.category ? String(item.category) : null,
    image_url: item.image_url ? String(item.image_url) : null,
    description: item.description ? String(item.description) : null,
    current_stock: Number(item.current_stock || 0),
    purchase_cost: item.purchase_cost ? Number(item.purchase_cost) : null,
    income_type_id: item.income_type_id ? String(item.income_type_id) : null
  }));
};