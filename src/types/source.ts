
export interface Source {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  has_products: boolean;
  has_services: boolean;
  has_consignments: boolean;
}
