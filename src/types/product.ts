export interface Product {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  product_type: 'basic' | 'composite';
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  min_stock?: number;
  created_at: string;
  updated_at: string;
}