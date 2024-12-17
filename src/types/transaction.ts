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
}