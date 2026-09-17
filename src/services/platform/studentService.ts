import { supabase } from '../supabase/client';

export interface LinkedStudent {
  id: string;
  name: string;
  email: string;
  status: string;
}

type LinkedStudentRow = {
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export async function listLinkedStudents(trainerId: string): Promise<LinkedStudent[]> {
  const { data, error } = await supabase
    .from('trainer_students')
    .select('status, student:profiles!trainer_students_student_id_fkey(id, name, email)')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as LinkedStudentRow[])
    .filter((row) => row.student)
    .map((row) => ({
      id: row.student?.id ?? '',
      name: row.student?.name ?? 'Aluno',
      email: row.student?.email ?? '',
      status: row.status,
    }));
}

export async function linkStudentByEmail(trainerId: string, email: string) {
  const { data, error } = await supabase.rpc('link_student_by_email', {
    trainer: trainerId,
    student_email: email.trim().toLowerCase(),
  });

  if (error) {
    throw error;
  }

  return data as string;
}
