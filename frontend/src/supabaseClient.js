import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    redirectTo: 'http://localhost:3001/complete-profile',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 