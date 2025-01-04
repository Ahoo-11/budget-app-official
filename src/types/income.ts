export interface IncomeFormData {
  id?: string;
  source_id: string;
  income_type_id?: string;
  subcategory_id?: string;
  name: string;
  remarks?: string;
  amount: number;
  date: Date;
  is_recurring: boolean;
  tags?: string[];
  photo?: File;
  photo_url?: string;
  current_stock?: number;
  minimum_stock?: number;
  unit_of_measure?: string;
  source?: string;
}

export interface QuickIncomeFormData {
  source_id: string;
  income_type_id?: string;
  subcategory_id?: string;
  name: string;
  amount: number;
  date: Date;
  is_recurring: boolean;
  source?: string;
}

export interface IncomeType {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeSubcategory {
  id: string;
  income_type_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeTypeSettings {
  id: string;
  source_id: string;
  income_type_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}