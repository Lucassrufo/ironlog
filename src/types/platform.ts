import { WorkoutRecord } from './models';

export type PlatformRole = 'trainer' | 'student';
export type PlatformStatus = 'draft' | 'active' | 'archived';

export interface PlatformProfile {
  id: string;
  role: PlatformRole;
  name: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformRoutineExercise {
  id: string;
  routineDayId: string;
  position: number;
  exerciseName: string;
  muscleGroup: string | null;
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  loadKg: number | null;
  notes: string | null;
}

export interface PlatformRoutineDay {
  id: string;
  routineId: string;
  position: number;
  title: string;
  focus: string | null;
  exercises: PlatformRoutineExercise[];
}

export interface PlatformRoutine {
  id: string;
  trainerId: string;
  title: string;
  description: string | null;
  status: PlatformStatus;
  days: PlatformRoutineDay[];
}

export interface AssignedRoutine {
  assignmentId: string;
  trainerId: string;
  studentId: string;
  routine: PlatformRoutine;
}

export interface WorkoutSessionMappingInput {
  studentId: string;
  trainerId?: string | null;
  routineId?: string | null;
  routineDayId?: string | null;
  clientSessionId: string;
  workoutTitle: string;
  durationSeconds: number;
  records: WorkoutRecord[];
}

export interface SupabaseWorkoutSessionInsert {
  student_id: string;
  trainer_id: string | null;
  routine_id: string | null;
  routine_day_id: string | null;
  title: string;
  duration_seconds: number;
  total_volume_kg: number;
  total_reps: number;
  work_seconds: number;
  client_session_id: string;
}

export interface SupabaseWorkoutSetInsert {
  exercise_name: string;
  muscle_group: string | null;
  set_number: number;
  reps: number | null;
  duration_seconds: number | null;
  load_kg: number | null;
  completed: boolean;
  notes: string | null;
}
