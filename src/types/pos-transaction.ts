import { BillProduct } from "./bill";

export type PosTransactionStatus = 'active' | 'completed';

export interface PosTransaction {
  id: string;
  source_id: string;
  user_id: string;
  type: 'pos_sale';
  items: BillProduct[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paid_amount: number;
  status: PosTransactionStatus;
  date: string;
  payer_id?: string | null;
}