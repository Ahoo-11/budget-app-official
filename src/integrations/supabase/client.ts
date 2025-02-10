import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
);

// Re-export createClient and Database type
export { createClient } from '@supabase/supabase-js';
export type { Database } from '@/types/supabase';

// Add type helper for better type inference
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Type helpers for specific tables
export type BillRow = Tables['budgetapp_bills']['Row'];
export type BillInsert = Tables['budgetapp_bills']['Insert'];
export type BillUpdate = Tables['budgetapp_bills']['Update'];

export type UserRoleRow = Tables['budgetapp_user_roles']['Row'];
export type SourceRow = Tables['budgetapp_sources']['Row'];
