import { BillProduct } from "./bill";
import { TransactionStatus } from "./transaction";

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
  status: TransactionStatus;
  date: string;
  payer_id?: string | null;
  created_by_name?: string;
}