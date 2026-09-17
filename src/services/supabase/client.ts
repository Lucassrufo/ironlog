import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { resolveSupabaseConfig } from './config';

const supabaseConfig = resolveSupabaseConfig(process.env);

export function getSupabaseConfigState() {
  return {
    isConfigured: supabaseConfig.isConfigured,
    url: supabaseConfig.url,
    hasAnonKey: supabaseConfig.hasAnonKey,
  };
}

export const supabase = createClient(
  supabaseConfig.url || 'https://example.supabase.co',
  supabaseConfig.anonKey || 'missing-anon-key',
  {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);
