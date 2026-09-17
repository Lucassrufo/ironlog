import { WorkoutPlan } from '../../types/models';
import {
  AssignedRoutine,
  SupabaseWorkoutSessionInsert,
  SupabaseWorkoutSetInsert,
  WorkoutSessionMappingInput,
} from '../../types/platform';
import { calculateWorkoutTotals } from '../../utils/workoutMetrics';

export function mapAssignedRoutineToWorkoutPlans(assignment: AssignedRoutine): WorkoutPlan[] {
  return [...assignment.routine.days]
    .sort((a, b) => a.position - b.position)
    .map((day) => ({
      id: `remote-${day.id}`,
      dayLabel: `Dia ${day.position}`,
      weekDay: Math.min(6, Math.max(1, day.position)),
      title: day.title,
      focus: day.focus ?? 'Treino designado',
      exercises: [...day.exercises]
        .sort((a, b) => a.position - b.position)
        .map((exercise) => ({
          id: `remote-${exercise.id}`,
          nome: exercise.exerciseName,
          grupoMuscular: exercise.muscleGroup ?? 'Geral',
          icone: exercise.durationSeconds ? 'timer-outline' : 'barbell-outline',
          suggestedSeries: exercise.sets,
          suggestedReps: exercise.reps ?? exercise.durationSeconds ?? 1,
          defaultKg: exercise.loadKg ?? 0,
          videoUrl: '',
          youtubeUrl: '',
          descricao: exercise.notes ?? 'Treino definido pelo treinador.',
        })),
    }));
}

export function mapWorkoutRecordsToSessionPayload(input: WorkoutSessionMappingInput): {
  session: SupabaseWorkoutSessionInsert;
  sets: SupabaseWorkoutSetInsert[];
} {
  const totals = calculateWorkoutTotals(input.records);
  const sets = input.records.flatMap((record) => {
    const measureType = record.measureType ?? 'reps';
    const recordSets = record.sets?.filter((set) => set.completed) ?? [];

    if (recordSets.length === 0) {
      return [];
    }

    return recordSets.map((set) => ({
      exercise_name: record.exerciseName,
      muscle_group: null,
      set_number: set.setNumber,
      reps: measureType === 'duration' ? null : set.repeticoes,
      duration_seconds: measureType === 'duration' ? set.repeticoes : null,
      load_kg: set.cargaKg,
      completed: set.completed,
      notes: record.note ?? null,
    }));
  });

  return {
    session: {
      student_id: input.studentId,
      trainer_id: input.trainerId ?? null,
      routine_id: input.routineId ?? null,
      routine_day_id: input.routineDayId ?? null,
      title: input.workoutTitle,
      duration_seconds: input.durationSeconds,
      total_volume_kg: totals.totalVolumeKg,
      total_reps: totals.totalReps,
      work_seconds: totals.workSeconds,
      client_session_id: input.clientSessionId,
    },
    sets,
  };
}
