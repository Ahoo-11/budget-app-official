import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database-types';

const supabaseUrl = 'https://btzllgnzmjdxzdioulfu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0emxsZ256bWpkeHpkaW91bGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDExNDYyNSwiZXhwIjoyMDQ5NjkwNjI1fQ.TPL9pm9KAhKhhZ2DYNFSTOtoNiPExNI6p_hrv66T6TE';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    },
    db: {
      schema: 'budget'
    }
  }
);

// Add type helper for better type inference
export type Schema = Database['budget'];
export type Tables = Schema['Tables'];
export type Enums = Schema['Enums'];

// Type helpers for specific tables
export type BillRow = Tables['bills']['Row'];
export type BillInsert = Tables['bills']['Insert'];
export type BillUpdate = Tables['bills']['Update'];
