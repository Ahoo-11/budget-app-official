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

export type TransactionStatus = "pending" | "completed" | "partially_paid";

export interface TransactionDisplay extends Transaction {
  displayStatus: TransactionStatus | "overdue";
}

export const isOverdue = (transaction: Transaction): boolean => {
  if (transaction.status !== "pending") return false;
  const transactionDate = new Date(transaction.date);
  const today = new Date();
  // Default to 1 day credit period if not specified
  return today > new Date(transactionDate.getTime() + 24 * 60 * 60 * 1000);
};

export const getDisplayStatus = (transaction: Transaction): TransactionStatus | "overdue" => {
  if (isOverdue(transaction)) return "overdue";
  return transaction.status;
};