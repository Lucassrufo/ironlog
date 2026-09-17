import { describe, expect, it } from 'vitest';

import { resolveSupabaseConfig } from '../config';

describe('resolveSupabaseConfig', () => {
  it('accepts EXPO_PUBLIC_SUPABASE_KEY as the Supabase public anon key alias', () => {
    const config = resolveSupabaseConfig({
      EXPO_PUBLIC_SUPABASE_URL: 'https://ironlog.supabase.co',
      EXPO_PUBLIC_SUPABASE_KEY: 'public-anon-key',
    });

    expect(config).toEqual({
      isConfigured: true,
      url: 'https://ironlog.supabase.co',
      anonKey: 'public-anon-key',
      hasAnonKey: true,
    });
  });
});
