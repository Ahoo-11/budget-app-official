import { Bill, BillProduct } from '@/types/bills';

export interface PosTransaction {
  id: string;
  date: string;
  amount: number;
  bill: Bill;
  products: BillProduct[];
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
