import { describe, expect, test } from 'vitest';

import { createPendingSessionSync } from '../sessionSyncService';

describe('session sync service', () => {
  test('creates a pending sync item from a mapped session payload', () => {
    const pending = createPendingSessionSync({
      session: {
        student_id: 'student-1',
        trainer_id: 'trainer-1',
        routine_id: 'routine-1',
        routine_day_id: 'day-1',
        title: 'Treino A',
        duration_seconds: 600,
        total_volume_kg: 1000,
        total_reps: 50,
        work_seconds: 0,
        client_session_id: 'session-1',
      },
      sets: [],
    });

    expect(pending).toMatchObject({
      id: 'session-1',
      status: 'pending',
      attempts: 0,
      payload: {
        session: expect.objectContaining({ client_session_id: 'session-1' }),
        sets: [],
      },
    });
    expect(typeof pending.createdAt).toBe('string');
  });
});
