import {
  ActiveWorkoutExerciseState,
  ExerciseMeasureType,
  WorkoutExercise,
  WorkoutRecord,
  WorkoutSetRecord,
} from '../types/models';

export interface RecordTotals {
  totalReps: number;
  totalVolumeKg: number;
  completedSets: number;
  maxLoadKg: number;
  durationSeconds: number;
}

export interface ExerciseSessionInput {
  exercise: WorkoutExercise;
  state: ActiveWorkoutExerciseState;
}

export type WorkoutRecordPayload = Omit<WorkoutRecord, 'id' | 'data' | 'durationSeconds' | 'workoutTitle'>;

function completedSets(sets: WorkoutSetRecord[]) {
  return sets.filter((set) => set.completed);
}

export function inferExerciseMeasureType(exercise: Pick<WorkoutExercise, 'nome' | 'grupoMuscular' | 'icone'>): ExerciseMeasureType {
  const text = `${exercise.nome} ${exercise.grupoMuscular} ${exercise.icone}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (text.includes('cardio') || text.includes('cardio') || text.includes('prancha') || text.includes('isometr')) {
    return 'duration';
  }

  return 'reps';
}

export function calculateRecordTotals({
  sets,
  measureType = 'reps',
}: {
  sets: WorkoutSetRecord[];
  measureType?: ExerciseMeasureType;
}): RecordTotals {
  const done = completedSets(sets);

  if (measureType === 'duration') {
    return {
      totalReps: 0,
      totalVolumeKg: 0,
      completedSets: done.length,
      maxLoadKg: Math.max(0, ...done.map((set) => set.cargaKg)),
      durationSeconds: done.reduce((sum, set) => sum + set.repeticoes, 0),
    };
  }

  return {
    totalReps: done.reduce((sum, set) => sum + set.repeticoes, 0),
    totalVolumeKg: done.reduce((sum, set) => sum + set.repeticoes * set.cargaKg, 0),
    completedSets: done.length,
    maxLoadKg: Math.max(0, ...done.map((set) => set.cargaKg)),
    durationSeconds: 0,
  };
}

export function createSessionRecords(items: ExerciseSessionInput[]): WorkoutRecordPayload[] {
  return items.reduce<WorkoutRecordPayload[]>((acc, { exercise, state }) => {
      const measureType = inferExerciseMeasureType(exercise);
      const sets = completedSets(state.sets);
      const totals = calculateRecordTotals({ sets, measureType });

      if (sets.length === 0) {
        return acc;
      }

      acc.push({
        exerciseId: exercise.id,
        exerciseName: exercise.nome,
        series: totals.completedSets,
        repeticoes: measureType === 'duration' ? 0 : Math.round(totals.totalReps / Math.max(1, totals.completedSets)),
        cargaKg: totals.maxLoadKg,
        sets,
        executionMode: state.mode,
        measureType,
        note: state.note,
        volumeKg: totals.totalVolumeKg,
        totalReps: totals.totalReps,
        workSeconds: totals.durationSeconds,
      });
      return acc;
    }, []);
}

export function calculateWorkoutTotals(records: Array<Pick<WorkoutRecord, 'sets' | 'measureType' | 'volumeKg' | 'totalReps' | 'workSeconds' | 'series' | 'repeticoes' | 'cargaKg'>>) {
  return records.reduce(
    (acc, record) => {
      const measureType = record.measureType ?? 'reps';
      const setTotals = record.sets ? calculateRecordTotals({ sets: record.sets, measureType }) : null;
      acc.totalReps += record.totalReps ?? setTotals?.totalReps ?? record.series * record.repeticoes;
      acc.totalVolumeKg += record.volumeKg ?? setTotals?.totalVolumeKg ?? record.cargaKg * record.series * record.repeticoes;
      acc.totalSets += setTotals?.completedSets ?? record.series;
      acc.workSeconds += record.workSeconds ?? setTotals?.durationSeconds ?? 0;
      acc.maxLoadKg = Math.max(acc.maxLoadKg, record.cargaKg, setTotals?.maxLoadKg ?? 0);
      return acc;
    },
    { totalReps: 0, totalVolumeKg: 0, totalSets: 0, maxLoadKg: 0, workSeconds: 0 },
  );
}
