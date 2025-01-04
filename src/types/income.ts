export interface IncomeType {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
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

export interface IncomeSubcategory {
  id: string;
  income_type_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeFormData {
  photo?: File;
  name: string;
  remarks?: string;
  income_type_id: string;
  subcategory_id: string;
  amount: number;
  date: Date;
  source: string;
  tags?: string[];
  is_recurring: boolean;
  // Additional fields for Product Sales
  current_stock?: number;
  minimum_stock?: number;
  unit_of_measure?: string;
}

// Quick add form data with minimal required fields
export interface QuickIncomeFormData {
  name: string;
  income_type_id: string;
  subcategory_id: string;
  amount: number;
  date: Date;
  source: string;
}
