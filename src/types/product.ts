export interface Product {
  id: string;
  source_id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  product_type: 'basic' | 'composite';
  measurement_unit_id?: string;
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  content_unit_id?: string;
  content_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  content_per_unit?: number;
  min_stock?: number;
  current_stock?: number;
  purchase_cost?: number;
  storage_location?: string;
  unit_of_measurement?: string;
  image_url?: string;
  minimum_stock_level?: number;
  created_at: string;
  updated_at: string;
}