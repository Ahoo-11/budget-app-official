export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      budgetapp_user_roles: {
        Row: {
          user_id: string
          role: 'controller' | 'admin' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role?: 'controller' | 'admin' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          role?: 'controller' | 'admin' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_profiles: {
        Row: {
          id: string
          email: string | null
          status: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          status?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          status?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_sources: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_source_permissions: {
        Row: {
          id: string
          user_id: string | null
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_categories: {
        Row: {
          id: string
          name: string
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          measurement_unit: string | null
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          measurement_unit?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          measurement_unit?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_bills: {
        Row: {
          id: string
          amount: number
          description: string | null
          bill_date: string
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string | null
          bill_date?: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string | null
          bill_date?: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_suppliers: {
        Row: {
          id: string
          name: string
          contact: string | null
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_expenses: {
        Row: {
          id: string
          amount: number
          description: string | null
          expense_date: string
          supplier_id: string | null
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string | null
          expense_date?: string
          supplier_id?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string | null
          expense_date?: string
          supplier_id?: string | null
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_stock_movements: {
        Row: {
          id: string
          product_id: string | null
          quantity: number
          movement_type: string
          movement_date: string
          source_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          quantity: number
          movement_type: string
          movement_date?: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          quantity?: number
          movement_type?: string
          movement_date?: string
          source_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      budgetapp_user_role: 'controller' | 'admin' | 'viewer'
    }
  }
}
