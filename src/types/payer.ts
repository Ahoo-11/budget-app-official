export interface Payer {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface PayerCreditSettings {
  id: string;
  source_id: string;
  payer_id: string;
  credit_days: number;
  created_at: string;
  updated_at: string;
}