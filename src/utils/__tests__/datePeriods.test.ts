import { describe, expect, test } from 'vitest';

import { filterRecordsByRange, getLocalDateKey, getPeriodRange } from '../datePeriods';
import { WorkoutRecord } from '../../types/models';

function record(id: string, data: string): WorkoutRecord {
  return {
    id,
    exerciseId: id,
    exerciseName: 'Supino',
    workoutTitle: 'Peito',
    series: 1,
    repeticoes: 10,
    cargaKg: 40,
    durationSeconds: 600,
    data,
  };
}

describe('date periods', () => {
  test('formats date keys with the local calendar date', () => {
    const date = new Date(2026, 8, 7, 23, 45);

    expect(getLocalDateKey(date)).toBe('2026-09-07');
  });

  test('filters records by an inclusive period range', () => {
    const range = getPeriodRange('week', new Date(2026, 8, 17, 12));
    const records = [
      record('old', new Date(2026, 8, 9, 10).toISOString()),
      record('inside', new Date(2026, 8, 12, 10).toISOString()),
      record('today', new Date(2026, 8, 17, 10).toISOString()),
    ];

    expect(filterRecordsByRange(records, range).map((item) => item.id)).toEqual(['inside', 'today']);
  });

  test('creates month range from the first to the last local day', () => {
    const range = getPeriodRange('month', new Date(2026, 1, 12, 8));

    expect(getLocalDateKey(range.start)).toBe('2026-02-01');
    expect(getLocalDateKey(range.end)).toBe('2026-02-28');
  });
});
