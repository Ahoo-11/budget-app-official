export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budgetapp_bills: {
        Row: {
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          items: Json | null
          paid_amount: number | null
          payer_id: string | null
          session_id: string | null
          source_id: string | null
          status: string | null
          title: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          paid_amount?: number | null
          payer_id?: string | null
          session_id?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          paid_amount?: number | null
          payer_id?: string | null
          session_id?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_bills_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_bills_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_budgets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budgetapp_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_categories_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_consignments: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          measurement_unit_id: string | null
          name: string
          purchase_price: number | null
          selling_price: number
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name: string
          purchase_price?: number | null
          selling_price?: number
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name?: string
          purchase_price?: number | null
          selling_price?: number
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_consignments_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_consignments_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_expenses: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          invoice_no: string | null
          source_id: string | null
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          invoice_no?: string | null
          source_id?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          invoice_no?: string | null
          source_id?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_expenses_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_measurement_units: {
        Row: {
          created_at: string | null
          id: string
          name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budgetapp_payers: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgetapp_products: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          description: string | null
          id: string
          last_purchase_date: string | null
          last_purchase_price: number | null
          name: string
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          name: string
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          name?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_products_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budgetapp_services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          measurement_unit_id: string | null
          name: string
          price: number
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name: string
          price?: number
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          measurement_unit_id?: string | null
          name?: string
          price?: number
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_services_measurement_unit_id_fkey"
            columns: ["measurement_unit_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_services_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_sessions: {
        Row: {
          created_at: string | null
          id: string
          source_id: string
          start_time: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_id: string
          start_time?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_id?: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_sessions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_source_payer_settings: {
        Row: {
          created_at: string | null
          credit_days: number
          id: string
          payer_id: string | null
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_days?: number
          id?: string
          payer_id?: string | null
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_days?: number
          id?: string
          payer_id?: string | null
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_source_payer_settings_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_payers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_source_payer_settings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_source_permissions: {
        Row: {
          created_at: string | null
          id: string
          source_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_source_permissions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_source_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budgetapp_sources: {
        Row: {
          created_at: string | null
          created_by: string | null
          has_consignments: boolean
          has_products: boolean
          has_services: boolean
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          has_consignments?: boolean
          has_products?: boolean
          has_services?: boolean
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          has_consignments?: boolean
          has_products?: boolean
          has_services?: boolean
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      budgetapp_stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_date: string | null
          movement_type: string
          product_id: string | null
          quantity: number
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_date?: string | null
          movement_type: string
          product_id?: string | null
          quantity: number
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_date?: string | null
          movement_type?: string
          product_id?: string | null
          quantity?: number
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_stock_movements_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_suppliers: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgetapp_templates: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgetapp_transactions: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          source_id: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_transactions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_type_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          source_id: string | null
          type_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          source_id?: string | null
          type_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          source_id?: string | null
          type_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgetapp_type_settings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgetapp_type_settings_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "budgetapp_types"
            referencedColumns: ["id"]
          },
        ]
      }
      budgetapp_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgetapp_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          source_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          source_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          source_id?: string | null
          user_id?: string | null
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
      sources: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      has_source_access: {
        Args: {
          user_id: string
          source_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
