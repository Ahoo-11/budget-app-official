export interface Service {
  id: string;
  source_id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
}