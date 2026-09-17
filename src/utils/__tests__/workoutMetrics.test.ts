import { describe, expect, test } from 'vitest';

import { calculateRecordTotals, createSessionRecords, inferExerciseMeasureType } from '../workoutMetrics';
import { WorkoutExercise } from '../../types/models';

function exercise(overrides: Partial<WorkoutExercise>): WorkoutExercise {
  return {
    id: 'exercise-1',
    nome: 'Supino reto',
    grupoMuscular: 'Peito',
    icone: 'barbell-outline',
    videoUrl: '',
    youtubeUrl: '',
    descricao: '',
    suggestedSeries: 3,
    suggestedReps: 10,
    defaultKg: 40,
    ...overrides,
  };
}

describe('workout metrics', () => {
  test('does not double bilateral load when calculating volume', () => {
    const totals = calculateRecordTotals({
      sets: [
        { setNumber: 1, repeticoes: 10, cargaKg: 40, completed: true },
        { setNumber: 2, repeticoes: 8, cargaKg: 42, completed: true },
      ],
    });

    expect(totals).toEqual({
      totalReps: 18,
      totalVolumeKg: 736,
      completedSets: 2,
      maxLoadKg: 42,
      durationSeconds: 0,
    });
  });

  test('treats plank and cardio as duration-based work', () => {
    expect(inferExerciseMeasureType(exercise({ nome: 'Prancha isometrica', grupoMuscular: 'Core' }))).toBe('duration');
    expect(inferExerciseMeasureType(exercise({ nome: 'Cardio moderado', grupoMuscular: 'Cardio' }))).toBe('duration');
  });

  test('creates records only from completed sets when finishing a partial workout', () => {
    const records = createSessionRecords([
      {
        exercise: exercise({ id: 'supino', nome: 'Supino reto' }),
        state: {
          exerciseId: 'supino',
          mode: 'bilateral',
          note: 'boa forma',
          sets: [
            { setNumber: 1, repeticoes: 10, cargaKg: 40, completed: true },
            { setNumber: 2, repeticoes: 10, cargaKg: 40, completed: false },
          ],
        },
      },
      {
        exercise: exercise({ id: 'prancha', nome: 'Prancha', grupoMuscular: 'Core', suggestedReps: 30, defaultKg: 0 }),
        state: {
          exerciseId: 'prancha',
          mode: 'bilateral',
          note: '',
          sets: [{ setNumber: 1, repeticoes: 45, cargaKg: 0, completed: true }],
        },
      },
    ]);

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      exerciseId: 'supino',
      series: 1,
      repeticoes: 10,
      cargaKg: 40,
      volumeKg: 400,
      totalReps: 10,
    });
    expect(records[1]).toMatchObject({
      exerciseId: 'prancha',
      series: 1,
      repeticoes: 0,
      cargaKg: 0,
      volumeKg: 0,
      totalReps: 0,
      workSeconds: 45,
    });
  });
});
