import { describe, expect, test } from 'vitest';

import { mapAssignedRoutineToWorkoutPlans, mapWorkoutRecordsToSessionPayload } from '../platformMappers';
import { AssignedRoutine } from '../../../types/platform';
import { WorkoutRecord } from '../../../types/models';

const assignedRoutine: AssignedRoutine = {
  assignmentId: 'assignment-1',
  trainerId: 'trainer-1',
  studentId: 'student-1',
  routine: {
    id: 'routine-1',
    trainerId: 'trainer-1',
    title: 'Hipertrofia A/B',
    description: 'Base',
    status: 'active',
    days: [
      {
        id: 'day-1',
        routineId: 'routine-1',
        position: 1,
        title: 'Peito e triceps',
        focus: 'Empurrar',
        exercises: [
          {
            id: 'exercise-1',
            routineDayId: 'day-1',
            position: 1,
            exerciseName: 'Supino reto',
            muscleGroup: 'Peito',
            sets: 4,
            reps: 10,
            durationSeconds: null,
            loadKg: 40,
            notes: 'Controle a descida',
          },
        ],
      },
      {
        id: 'day-2',
        routineId: 'routine-1',
        position: 2,
        title: 'Core',
        focus: 'Estabilidade',
        exercises: [
          {
            id: 'exercise-2',
            routineDayId: 'day-2',
            position: 1,
            exerciseName: 'Prancha',
            muscleGroup: 'Core',
            sets: 3,
            reps: null,
            durationSeconds: 45,
            loadKg: null,
            notes: null,
          },
        ],
      },
    ],
  },
};

function record(overrides: Partial<WorkoutRecord>): WorkoutRecord {
  return {
    id: 'record-1',
    sessionId: 'session-1',
    exerciseId: 'exercise-1',
    exerciseName: 'Supino reto',
    workoutTitle: 'Peito',
    series: 1,
    repeticoes: 10,
    cargaKg: 40,
    sets: [{ setNumber: 1, repeticoes: 10, cargaKg: 40, completed: true }],
    durationSeconds: 900,
    data: '2026-09-17T12:00:00.000Z',
    volumeKg: 400,
    totalReps: 10,
    ...overrides,
  };
}

describe('platform mappers', () => {
  test('maps assigned routine days to workout plans sorted by position', () => {
    const plans = mapAssignedRoutineToWorkoutPlans(assignedRoutine);

    expect(plans).toEqual([
      {
        id: 'remote-day-1',
        dayLabel: 'Dia 1',
        weekDay: 1,
        title: 'Peito e triceps',
        focus: 'Empurrar',
        exercises: [
          expect.objectContaining({
            id: 'remote-exercise-1',
            nome: 'Supino reto',
            grupoMuscular: 'Peito',
            suggestedSeries: 4,
            suggestedReps: 10,
            defaultKg: 40,
          }),
        ],
      },
      {
        id: 'remote-day-2',
        dayLabel: 'Dia 2',
        weekDay: 2,
        title: 'Core',
        focus: 'Estabilidade',
        exercises: [
          expect.objectContaining({
            id: 'remote-exercise-2',
            nome: 'Prancha',
            grupoMuscular: 'Core',
            suggestedSeries: 3,
            suggestedReps: 45,
            defaultKg: 0,
          }),
        ],
      },
    ]);
  });

  test('maps local records to a Supabase workout session payload', () => {
    const payload = mapWorkoutRecordsToSessionPayload({
      studentId: 'student-1',
      trainerId: 'trainer-1',
      routineId: 'routine-1',
      routineDayId: 'day-1',
      clientSessionId: 'session-1',
      workoutTitle: 'Peito',
      durationSeconds: 900,
      records: [
        record({ id: 'record-1' }),
        record({
          id: 'record-2',
          exerciseId: 'exercise-2',
          exerciseName: 'Prancha',
          measureType: 'duration',
          series: 1,
          repeticoes: 0,
          cargaKg: 0,
          volumeKg: 0,
          totalReps: 0,
          workSeconds: 45,
          sets: [{ setNumber: 1, repeticoes: 45, cargaKg: 0, completed: true }],
        }),
      ],
    });

    expect(payload.session).toEqual({
      student_id: 'student-1',
      trainer_id: 'trainer-1',
      routine_id: 'routine-1',
      routine_day_id: 'day-1',
      title: 'Peito',
      duration_seconds: 900,
      total_volume_kg: 400,
      total_reps: 10,
      work_seconds: 45,
      client_session_id: 'session-1',
    });
    expect(payload.sets).toEqual([
      expect.objectContaining({
        exercise_name: 'Supino reto',
        set_number: 1,
        reps: 10,
        duration_seconds: null,
        load_kg: 40,
      }),
      expect.objectContaining({
        exercise_name: 'Prancha',
        set_number: 1,
        reps: null,
        duration_seconds: 45,
        load_kg: 0,
      }),
    ]);
  });
});
