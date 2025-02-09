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
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_sources: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_categories: {
        Row: {
          id: string
          source_id: string
          name: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          name: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          name?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_bills: {
        Row: {
          id: string
          source_id: string | null
          user_id: string | null
          payer_id: string | null
          items: Json
          subtotal: number
          discount: number
          gst: number
          total: number
          paid_amount: number
          status: string
          payment_method: string
          date: string
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id?: string | null
          user_id?: string | null
          payer_id?: string | null
          items: Json
          subtotal: number
          discount: number
          gst: number
          total: number
          paid_amount: number
          status: string
          payment_method: string
          date: string
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string | null
          user_id?: string | null
          payer_id?: string | null
          items?: Json
          subtotal?: number
          discount?: number
          gst?: number
          total?: number
          paid_amount?: number
          status?: string
          payment_method?: string
          date?: string
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_consignments: {
        Row: {
          id: string
          source_id: string
          user_id: string
          payer_id: string
          items: Json
          total: number
          status: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          user_id: string
          payer_id: string
          items: Json
          total: number
          status: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          user_id?: string
          payer_id?: string
          items?: Json
          total?: number
          status?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_income_entries: {
        Row: {
          id: string
          source_id: string
          type_id: string
          amount: number
          description: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          type_id: string
          amount: number
          description?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          type_id?: string
          amount?: number
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_payers: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_products: {
        Row: {
          id: string
          source_id: string
          name: string
          product_type: string
          current_stock: number
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          name: string
          product_type: string
          current_stock: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          name?: string
          product_type?: string
          current_stock?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_sessions: {
        Row: {
          id: string
          source_id: string
          user_id: string
          status: string
          start_time: string
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          user_id: string
          status: string
          start_time: string
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          user_id?: string
          status?: string
          start_time?: string
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_source_payer_settings: {
        Row: {
          id: string
          source_id: string
          payer_id: string
          credit_days: number
          credit_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_id: string
          payer_id: string
          credit_days: number
          credit_limit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          payer_id?: string
          credit_days?: number
          credit_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      budgetapp_source_permissions: {
        Row: {
          id: string
          user_id: string
          source_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_id?: string
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
      [_ in never]: never
    }
  }
}

// Re-export createClient and Database type
export { createClient } from '@supabase/supabase-js'
export type { Database } from '@/types/database-types'

// Add type helper for better type inference
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Type helpers for specific tables
export type UserRoleRow = Tables['budgetapp_user_roles']['Row']
export type SourceRow = Tables['budgetapp_sources']['Row']
export type CategoryRow = Tables['budgetapp_categories']['Row']
