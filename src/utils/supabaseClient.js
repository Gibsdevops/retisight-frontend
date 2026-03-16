import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znvvzljirqpjbhqulnvz.supabase.co';
const supabaseAnonKey = 'sb_publishable_fzj6q28Eee7O4OMYL1VL3Q_bMmnDOt_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);