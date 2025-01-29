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
      bills: {
        Row: {
          id: string
          source_id: string
          user_id: string
          items: Json
          subtotal: number
          gst: number
          total: number
          status: 'active' | 'completed'
          payer_id?: string | null
          paid_amount: number
          created_at: string
          updated_at: string
          date: string
          income_type_id?: string | null
        }
        Insert: {
          id?: string
          source_id: string
          user_id: string
          items: Json
          subtotal: number
          gst: number
          total: number
          status: 'active' | 'completed'
          payer_id?: string | null
          paid_amount: number
          created_at?: string
          updated_at?: string
          date: string
          income_type_id?: string | null
        }
        Update: {
          id?: string
          source_id?: string
          user_id?: string
          items?: Json
          subtotal?: number
          gst?: number
          total?: number
          status?: 'active' | 'completed'
          payer_id?: string | null
          paid_amount?: number
          created_at?: string
          updated_at?: string
          date?: string
          income_type_id?: string | null
        }
      }
      // Add other tables here...
    }
  }
}
