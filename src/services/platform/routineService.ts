import { AssignedRoutine, PlatformRoutine } from '../../types/platform';
import { supabase } from '../supabase/client';

export async function listTrainerRoutines(trainerId: string) {
  const { data, error } = await supabase.from('routines').select('*').eq('trainer_id', trainerId).order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createRoutine(trainerId: string, title: string, description?: string) {
  const { data, error } = await supabase
    .from('routines')
    .insert({ trainer_id: trainerId, title, description: description ?? null, status: 'draft' })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function createRoutineWithFirstExercise({
  trainerId,
  title,
  dayTitle,
  focus,
  exerciseName,
  muscleGroup,
  sets,
  reps,
  loadKg,
}: {
  trainerId: string;
  title: string;
  dayTitle: string;
  focus?: string;
  exerciseName: string;
  muscleGroup?: string;
  sets: number;
  reps: number;
  loadKg: number;
}) {
  const routineId = await createRoutine(trainerId, title);
  const { data: day, error: dayError } = await supabase
    .from('routine_days')
    .insert({ routine_id: routineId, position: 1, title: dayTitle, focus: focus ?? null })
    .select('id')
    .single();

  if (dayError) {
    throw dayError;
  }

  const { error: exerciseError } = await supabase.from('routine_exercises').insert({
    routine_day_id: day.id,
    position: 1,
    exercise_name: exerciseName,
    muscle_group: muscleGroup ?? null,
    sets,
    reps,
    load_kg: loadKg,
  });

  if (exerciseError) {
    throw exerciseError;
  }

  await supabase.from('routines').update({ status: 'active' }).eq('id', routineId);
  return routineId;
}

export async function assignRoutineToStudent({
  trainerId,
  studentId,
  routineId,
}: {
  trainerId: string;
  studentId: string;
  routineId: string;
}) {
  await supabase
    .from('routine_assignments')
    .update({ status: 'ended' })
    .eq('student_id', studentId)
    .eq('status', 'active');

  const { data, error } = await supabase
    .from('routine_assignments')
    .insert({ trainer_id: trainerId, student_id: studentId, routine_id: routineId, status: 'active' })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function getActiveAssignedRoutine(studentId: string): Promise<AssignedRoutine | null> {
  const { data, error } = await supabase
    .from('routine_assignments')
    .select(`
      id,
      trainer_id,
      student_id,
      routine:routines (
        id,
        trainer_id,
        title,
        description,
        status,
        days:routine_days (
          id,
          routine_id,
          position,
          title,
          focus,
          exercises:routine_exercises (
            id,
            routine_day_id,
            position,
            exercise_name,
            muscle_group,
            sets,
            reps,
            duration_seconds,
            load_kg,
            notes
          )
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const routine = data.routine as unknown as PlatformRoutine;
  return {
    assignmentId: data.id as string,
    trainerId: data.trainer_id as string,
    studentId: data.student_id as string,
    routine,
  };
}
