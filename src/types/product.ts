export interface Product {
  id: string;
  source_id: string;
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}