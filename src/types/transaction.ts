export interface Transaction {
  id: string;
  user_id: string;
  source_id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  category_id?: string;
  payer_id?: string;
  date: string;
  created_at?: string;
  created_by_name: string;
  status: TransactionStatus;
  document_url?: string;
  total_amount?: number;
  remaining_amount?: number;
  parent_transaction_id?: string;
}

export type TransactionStatus = "pending" | "approved" | "completed" | "overdue" | "cancelled" | "partially_paid";