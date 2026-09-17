import { User, WorkoutPlan } from '../types/models';

export function limitPlansForUser(plans: WorkoutPlan[], user: Pick<User, 'diasTreinoSemana'> | null | undefined) {
  if (plans.length === 0) {
    return plans;
  }

  const preferredDays = Math.floor(user?.diasTreinoSemana ?? plans.length);
  const limit = Math.min(plans.length, Math.max(1, preferredDays));
  return plans.slice(0, limit);
}
