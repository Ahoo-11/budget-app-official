export interface Product {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price: number;
  product_type: 'basic' | 'composite';
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  current_stock?: number;
  purchase_cost?: number;
  minimum_stock_level?: number;
  storage_location?: string;
  unit_of_measurement?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}