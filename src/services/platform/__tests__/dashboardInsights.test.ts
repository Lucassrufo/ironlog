import { describe, expect, it } from 'vitest';

import { buildWeeklyWorkoutBars, summarizeStudentWorkoutPosts } from '../dashboardInsights';

describe('dashboardInsights', () => {
  it('builds seven local day bars with scaled values', () => {
    const bars = buildWeeklyWorkoutBars(
      [
        { completedAt: '2026-09-15T10:00:00.000Z', value: 1200 },
        { completedAt: '2026-09-17T10:00:00.000Z', value: 2400 },
      ],
      new Date('2026-09-17T12:00:00.000Z'),
    );

    expect(bars).toHaveLength(7);
    expect(bars.at(-3)).toMatchObject({ value: 1200, progress: 0.5 });
    expect(bars.at(-1)).toMatchObject({ value: 2400, progress: 1 });
  });

  it('summarizes student posts for the dashboard', () => {
    const summary = summarizeStudentWorkoutPosts([
      {
        data: '2026-09-17T12:00:00.000Z',
        workoutTitle: 'Treino A',
        totalVolumeKg: 3200,
        totalReps: 80,
      },
      {
        data: '2026-09-10T12:00:00.000Z',
        workoutTitle: 'Treino B',
        totalVolumeKg: 1800,
        totalReps: 50,
      },
    ]);

    expect(summary).toEqual({
      totalWorkouts: 2,
      totalVolumeKg: 5000,
      totalReps: 130,
      lastWorkoutTitle: 'Treino A',
      lastWorkoutDate: '2026-09-17T12:00:00.000Z',
    });
  });
});
