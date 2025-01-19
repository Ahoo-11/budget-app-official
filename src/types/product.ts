export interface Product {
  id: string;
  source_id: string;
  name: string;
  price: number;
  category?: string;
  subcategory?: string;
  image_url?: string;
  description?: string;
  purchase_cost?: number;
  minimum_stock_level?: number;
  current_stock?: number;
  supplier_id?: string;
  storage_location?: string;
  unit_of_measurement?: string;
  product_type: 'basic' | 'composite';
  measurement_unit_id?: string;
  created_at: string;
  updated_at: string;
}