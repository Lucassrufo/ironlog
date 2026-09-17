import { ExperienceLevel, User } from '../types/models';

export const REQUIRED_DAYS_TO_PROGRESS = 30;

export function getNextLevel(level: ExperienceLevel): ExperienceLevel {
  if (level === 'iniciante') {
    return 'regular';
  }

  if (level === 'regular') {
    return 'profissional';
  }

  return 'profissional';
}

export function applyWorkoutProgression(user: User): User {
  if (user.nivelAtual === 'profissional') {
    return {
      ...user,
      completedDaysInLevel: user.completedDaysInLevel + 1,
    };
  }

  const completedDaysInLevel = user.completedDaysInLevel + 1;

  if (completedDaysInLevel >= REQUIRED_DAYS_TO_PROGRESS) {
    return {
      ...user,
      nivelAtual: getNextLevel(user.nivelAtual),
      dataInicioNivel: new Date().toISOString(),
      completedDaysInLevel: 0,
      activeWorkoutIndex: 0,
    };
  }

  return {
    ...user,
    completedDaysInLevel,
  };
}
