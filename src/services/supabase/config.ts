type SupabaseEnvironment = Record<string, string | undefined>;

export function resolveSupabaseConfig(environment: SupabaseEnvironment) {
  const url = environment.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey =
    environment.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || environment.EXPO_PUBLIC_SUPABASE_KEY?.trim() || '';

  return {
    isConfigured: Boolean(url && anonKey),
    url,
    anonKey,
    hasAnonKey: Boolean(anonKey),
  };
}
