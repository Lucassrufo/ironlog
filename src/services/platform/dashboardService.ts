import { addDays } from '../../utils/datePeriods';

export interface TrainerDashboardMetricsInput {
  students: Array<{ id: string; status: string }>;
  routines: Array<{ id: string; status: string }>;
  sessions: Array<{ id: string; completedAt: string }>;
  unreadMessages: number;
  now?: Date;
}

export function calculateTrainerDashboardMetrics(input: TrainerDashboardMetricsInput) {
  const now = input.now ?? new Date();
  const weekStart = addDays(now, -6);

  return {
    totalStudents: input.students.length,
    activeStudents: input.students.filter((student) => student.status === 'active').length,
    activeRoutines: input.routines.filter((routine) => routine.status === 'active').length,
    workoutsThisWeek: input.sessions.filter((session) => {
      const completedAt = new Date(session.completedAt);
      return completedAt >= weekStart && completedAt <= now;
    }).length,
    unreadMessages: input.unreadMessages,
  };
}
