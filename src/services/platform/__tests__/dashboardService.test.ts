import { describe, expect, test } from 'vitest';

import { calculateTrainerDashboardMetrics } from '../dashboardService';

describe('dashboard service', () => {
  test('calculates trainer dashboard metrics from linked students, routines, sessions and unread messages', () => {
    const metrics = calculateTrainerDashboardMetrics({
      students: [
        { id: '1', status: 'active' },
        { id: '2', status: 'archived' },
      ],
      routines: [
        { id: 'routine-1', status: 'active' },
        { id: 'routine-2', status: 'draft' },
      ],
      sessions: [
        { id: 'session-1', completedAt: '2026-09-15T12:00:00.000Z' },
        { id: 'session-2', completedAt: '2026-08-01T12:00:00.000Z' },
      ],
      unreadMessages: 3,
      now: new Date('2026-09-17T12:00:00.000Z'),
    });

    expect(metrics).toEqual({
      totalStudents: 2,
      activeStudents: 1,
      activeRoutines: 1,
      workoutsThisWeek: 1,
      unreadMessages: 3,
    });
  });
});
