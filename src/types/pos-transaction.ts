import { BillProduct } from "./bill";

export type PosTransactionStatus = 'active' | 'pending' | 'completed' | 'partially_paid';

export interface PosTransaction {
  id: string;
  source_id: string;
  user_id: string;
  type: 'pos_sale';
  description: string;
  items: BillProduct[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paid_amount: number;
  status: PosTransactionStatus;
  date: string;
  payer_id?: string | null;
  created_by_name?: string;
}