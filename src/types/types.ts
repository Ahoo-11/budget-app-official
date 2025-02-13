export interface Type {
  id: string;
  name: string;
  description?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TypeSettings {
  id: string;
  source_id: string;
  payer_id: string;
  credit_days: number;
  created_at: string | null;
  updated_at: string | null;
}

// Removing TypeSubcategory since it's not in the database schema

// Alias for backward compatibility
export type IncomeType = Type;