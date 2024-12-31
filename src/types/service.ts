export interface Service {
  id: string;
  source_id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}