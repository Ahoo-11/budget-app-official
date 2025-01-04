export interface Type {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TypeSubcategory {
  id: string;
  type_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TypeSettings {
  id: string;
  source_id: string;
  type_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}