export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          created_at: string
          date: string
          discount: number
          gst: number
          id: string
          items: Json
          paid_amount: number
          payer_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          session_id: string | null
          source_id: string
          status: string
          subtotal: number
          total: number
          type_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          discount?: number
          gst?: number
          id?: string
          items?: Json
          paid_amount?: number
          payer_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          session_id?: string | null
          source_id: string
          status: string
          subtotal?: number
          total?: number
          type_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          discount?: number
          gst?: number
          id?: string
          items?: Json
          paid_amount?: number
          payer_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          session_id?: string | null
          source_id?: string
          status?: string
          subtotal?: number
          total?: number
          type_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_income_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "payers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          source_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          source_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      consignment_settlements: {
        Row: {
          consignment_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          quantity_sold: number
          settlement_date: string
          status: string
          supplier_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          consignment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          quantity_sold: number
          settlement_date: string
          status?: string
          supplier_amount: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          consignment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          quantity_sold?: number
          settlement_date?: string
          status?: string
          supplier_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consignment_settlements_consignment_id_fkey"
            columns: ["consignment_id"]
            isOneToOne: false
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          },
        ]
      }
      consignments: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number | null
          description: string | null
          id: string
          image_url: string | null
          measurement_unit_id: string | null
          minimum_stock_level: number | null
          name: string
          selling_price: number
          source_id: string
          storage_location: string | null
          subcategory: string | null
          supplier_id: string
          unit_cost: number
          unit_of_measurement: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          measurement_unit_id?: string | null
          minimum_stock_level?: number | null
          name: string
          selling_price: number
          source_id: string
          storage_location?: string | null
          subcategory?: string | null
          supplier_id: string
          unit_cost: number
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          measurement_unit_id?: string | null
          minimum_stock_level?: number | null
          name?: string
          selling_price?: number
          source_id?: string
          storage_location?: string | null
          subcategory?: string | null
          supplier_id?: string
          unit_cost?: number
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consignments_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignments_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          current_stock: number | null
          date: string
          id: string
          is_recurring: boolean | null
          measurement_unit_id: string | null
          minimum_stock: number | null
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          photo_url: string | null
          remarks: string | null
          session_id: string | null
          source_id: string | null
          subcategory_id: string | null
          tags: string[] | null
          type_id: string | null
          unit_of_measure: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          current_stock?: number | null
          date: string
          id?: string
          is_recurring?: boolean | null
          measurement_unit_id?: string | null
          minimum_stock?: number | null
          name: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          photo_url?: string | null
          remarks?: string | null
          session_id?: string | null
          source_id?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          type_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          current_stock?: number | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          measurement_unit_id?: string | null
          minimum_stock?: number | null
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          photo_url?: string | null
          remarks?: string | null
          session_id?: string | null
          source_id?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          type_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_entries_income_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "type_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      measurement_units: {
        Row: {
          base_unit: string | null
          conversion_factor: number | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          symbol: string
          type: Database["public"]["Enums"]["measurement_unit_type"]
          updated_at: string
        }
        Insert: {
          base_unit?: string | null
          conversion_factor?: number | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          symbol: string
          type: Database["public"]["Enums"]["measurement_unit_type"]
          updated_at?: string
        }
        Update: {
          base_unit?: string | null
          conversion_factor?: number | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          symbol?: string
          type?: Database["public"]["Enums"]["measurement_unit_type"]
          updated_at?: string
        }
        Relationships: []
      }
      payers: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          batch_number: string
          created_at: string
          expiry_date: string | null
          id: string
          product_id: string
          purchase_date: string
          quantity: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id: string
          purchase_date: string
          quantity?: number
          unit_cost: number
          updated_at?: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          product_id?: string
          purchase_date?: string
          quantity?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recipes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          content_per_unit: number | null
          content_unit_id: string | null
          created_at: string
          current_stock: number | null
          description: string | null
          id: string
          image_url: string | null
          measurement_unit_id: string | null
          minimum_stock_level: number | null
          name: string
          price: number | null
          product_type: Database["public"]["Enums"]["product_type_enum"]
          purchase_cost: number | null
          source_id: string
          storage_location: string | null
          subcategory: string | null
          supplier_id: string | null
          unit_of_measurement: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_per_unit?: number | null
          content_unit_id?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          measurement_unit_id?: string | null
          minimum_stock_level?: number | null
          name: string
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type_enum"]
          purchase_cost?: number | null
          source_id: string
          storage_location?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_per_unit?: number | null
          content_unit_id?: string | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          measurement_unit_id?: string | null
          minimum_stock_level?: number | null
          name?: string
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type_enum"]
          purchase_cost?: number | null
          source_id?: string
          storage_location?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_content_unit_id_fkey"
            columns: ["content_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          content_quantity: number
          created_at: string
          id: string
          ingredient_id: string
          measurement_unit_id: string | null
          quantity: number
          recipe_id: string
          unit_of_measurement: string
          updated_at: string
        }
        Insert: {
          content_quantity?: number
          created_at?: string
          id?: string
          ingredient_id: string
          measurement_unit_id?: string | null
          quantity: number
          recipe_id: string
          unit_of_measurement: string
          updated_at?: string
        }
        Update: {
          content_quantity?: number
          created_at?: string
          id?: string
          ingredient_id?: string
          measurement_unit_id?: string | null
          quantity?: number
          recipe_id?: string
          unit_of_measurement?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "product_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          measurement_unit_id: string | null
          name: string
          price: number
          source_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name: string
          price: number
          source_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name?: string
          price?: number
          source_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          consolidated_by: string | null
          created_at: string
          end_time: string | null
          id: string
          reconciliation_notes: string | null
          reconciliation_time: string | null
          source_id: string
          start_time: string
          status: Database["public"]["Enums"]["session_status"]
          total_cash: number
          total_expenses: number
          total_sales: number
          total_transfer: number
          updated_at: string
          verified_cash_amount: number | null
        }
        Insert: {
          consolidated_by?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          reconciliation_notes?: string | null
          reconciliation_time?: string | null
          source_id: string
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"]
          total_cash?: number
          total_expenses?: number
          total_sales?: number
          total_transfer?: number
          updated_at?: string
          verified_cash_amount?: number | null
        }
        Update: {
          consolidated_by?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          reconciliation_notes?: string | null
          reconciliation_time?: string | null
          source_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"]
          total_cash?: number
          total_expenses?: number
          total_sales?: number
          total_transfer?: number
          updated_at?: string
          verified_cash_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_payer_settings: {
        Row: {
          created_at: string
          credit_days: number
          id: string
          payer_id: string
          source_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_days?: number
          id?: string
          payer_id: string
          source_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_days?: number
          id?: string
          payer_id?: string
          source_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_payer_settings_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "payers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_payer_settings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          source_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          source_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          source_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_permissions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_templates: {
        Row: {
          config: Json
          created_at: string
          source_id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          source_id: string
          template_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          source_id?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_templates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string
          expiry_date: string | null
          id: string
          is_consignment_return: boolean | null
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by: string
          expiry_date?: string | null
          id?: string
          is_consignment_return?: boolean | null
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string
          expiry_date?: string | null
          id?: string
          is_consignment_return?: boolean | null
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_settlement_terms: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          payment_terms: number
          settlement_frequency: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          payment_terms: number
          settlement_frequency: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          payment_terms?: number
          settlement_frequency?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_settlement_terms_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_info: Json | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          category_id: string | null
          created_at: string
          created_by_name: string
          date: string
          description: string
          document_url: string | null
          id: string
          is_recurring: boolean | null
          next_occurrence: string | null
          parent_transaction_id: string | null
          payer_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          recurring_frequency: string | null
          remaining_amount: number | null
          session_id: string | null
          source_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          total_amount: number | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by_name?: string
          date?: string
          description: string
          document_url?: string | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence?: string | null
          parent_transaction_id?: string | null
          payer_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          recurring_frequency?: string | null
          remaining_amount?: number | null
          session_id?: string | null
          source_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          total_amount?: number | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by_name?: string
          date?: string
          description?: string
          document_url?: string | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence?: string | null
          parent_transaction_id?: string | null
          payer_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          recurring_frequency?: string | null
          remaining_amount?: number | null
          session_id?: string | null
          source_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          total_amount?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "payers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      type_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          source_id: string | null
          type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          source_id?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          source_id?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_type_settings_income_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_type_settings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      type_subcategories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_subcategories_income_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          token: string
        }
        Returns: Json
      }
      assign_source_to_user: {
        Args: {
          target_user_email: string
          source_name: string
        }
        Returns: undefined
      }
      calculate_available_content: {
        Args: {
          product_id: string
        }
        Returns: number
      }
      calculate_required_units: {
        Args: {
          required_content: number
          content_per_unit: number
        }
        Returns: number
      }
      create_bill_items: {
        Args: {
          p_bill_id: string
          p_items: Json[]
        }
        Returns: undefined
      }
      create_profile: {
        Args: {
          user_id: string
          user_email: string
        }
        Returns: undefined
      }
      create_source_permission: {
        Args: {
          user_id: string
          source_id: string
        }
        Returns: undefined
      }
      create_user_role: {
        Args: {
          user_id: string
          user_role: string
        }
        Returns: undefined
      }
      delete_auth_user: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
      get_session_stats: {
        Args: {
          source_id: string
        }
        Returns: {
          total_sessions: number
          active_sessions: number
          closed_sessions: number
          avg_duration: unknown
          status_lengths: Json
        }[]
      }
      has_full_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_controller: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      make_price_optional: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      measurement_unit_type: "weight" | "volume" | "length" | "unit" | "time"
      payment_method: "cash" | "transfer"
      product_type_enum: "basic" | "composite" | "consignment"
      recurring_frequency: "daily" | "weekly" | "monthly" | "yearly"
      session_status: "active" | "closing" | "closed" | "reconciled"
      template_type: "business" | "personal"
      transaction_status: "pending" | "completed" | "partially_paid"
      user_role_type:
        | "super_admin"
        | "admin"
        | "manager"
        | "viewer"
        | "controller"
      user_status_type: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export interface Transaction {
    id: string;
    source_id: string;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category: string;
    user_id: string;
    created_at: string;
}

export interface TypeSettings {
    id: string;
    type_id: string;
    is_enabled: boolean;
    user_id: string;
    created_at: string;
}
