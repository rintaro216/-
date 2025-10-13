import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase環境変数が設定されていません。');
  console.warn('Phase 2でSupabaseを使用する場合は、.env.localファイルを作成してください。');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey &&
         supabaseUrl !== 'https://placeholder.supabase.co';
};
