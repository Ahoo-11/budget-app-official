import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btzllgnzmjdxzdioulfu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0emxsZ256bWpkeHpkaW91bGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTQ2MjUsImV4cCI6MjA0OTY5MDYyNX0._jtaTLJHipFUQAyP6ghzLzeDq8yuEMQd_PJ8T73tsx8";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
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
    }
  }
);