import { PlatformProfile, PlatformRole } from '../../types/platform';
import { supabase } from '../supabase/client';
import { sanitizeOwnProfilePayload } from './profilePayload';

function mapProfile(row: { id: string; role: PlatformRole; name: string; email?: string; created_at?: string; updated_at?: string }): PlatformProfile {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('id, role, name, email, created_at, updated_at').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data as { id: string; role: PlatformRole; name: string; email?: string; created_at?: string; updated_at?: string }) : null;
}

export async function createOwnProfile(profile: { id: string; role: PlatformRole; name: string; email: string }) {
  const payload = sanitizeOwnProfilePayload(profile);
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: payload.id,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    }, {
      onConflict: 'id',
    })
    .select('id, role, name, email, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data as { id: string; role: PlatformRole; name: string; email?: string; created_at?: string; updated_at?: string });
}
