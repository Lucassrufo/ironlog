import { SupabaseWorkoutSessionInsert, SupabaseWorkoutSetInsert } from '../../types/platform';

export interface SessionSyncPayload {
  session: SupabaseWorkoutSessionInsert;
  sets: SupabaseWorkoutSetInsert[];
}

export interface PendingSessionSync {
  id: string;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  createdAt: string;
  payload: SessionSyncPayload;
  lastError?: string;
}

export function createPendingSessionSync(payload: SessionSyncPayload): PendingSessionSync {
  return {
    id: payload.session.client_session_id,
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
    payload,
  };
}

export async function syncWorkoutSession(payload: SessionSyncPayload) {
  const { supabase } = await import('../supabase/client');
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert(payload.session)
    .select('id')
    .single();

  if (sessionError) {
    throw sessionError;
  }

  if (payload.sets.length > 0) {
    const { error: setsError } = await supabase.from('workout_session_sets').insert(
      payload.sets.map((set) => ({
        ...set,
        session_id: session.id,
      })),
    );

    if (setsError) {
      throw setsError;
    }
  }

  return session.id as string;
}
