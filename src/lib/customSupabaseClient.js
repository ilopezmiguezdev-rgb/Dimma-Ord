import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnipetazibbqlpteumjd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaXBldGF6aWJicWxwdGV1bWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzgxNDEsImV4cCI6MjA2NTE1NDE0MX0.2tAWvhV6BZ1PLgJ6umRWPIX9U1e7oWbxxwgd2c5cc5o';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
