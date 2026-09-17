type WorkoutBarInput = {
  completedAt: string;
  value: number;
};

type StudentWorkoutPost = {
  data: string;
  workoutTitle: string;
  totalVolumeKg: number;
  totalReps: number;
};

function toLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addLocalDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildWeeklyWorkoutBars(items: WorkoutBarInput[], now = new Date()) {
  const start = addLocalDays(now, -6);
  const valuesByDay = items.reduce<Record<string, number>>((acc, item) => {
    const key = toLocalDayKey(new Date(item.completedAt));
    acc[key] = (acc[key] ?? 0) + item.value;
    return acc;
  }, {});

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addLocalDays(start, index);
    const key = toLocalDayKey(date);

    return {
      key,
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      value: valuesByDay[key] ?? 0,
    };
  });

  const maxValue = Math.max(1, ...days.map((day) => day.value));

  return days.map((day) => ({
    ...day,
    progress: Number((day.value / maxValue).toFixed(3)),
  }));
}

export function summarizeStudentWorkoutPosts(posts: StudentWorkoutPost[]) {
  const sorted = [...posts].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const lastWorkout = sorted[0];

  return {
    totalWorkouts: posts.length,
    totalVolumeKg: Math.round(posts.reduce((sum, post) => sum + post.totalVolumeKg, 0)),
    totalReps: posts.reduce((sum, post) => sum + post.totalReps, 0),
    lastWorkoutTitle: lastWorkout?.workoutTitle ?? '-',
    lastWorkoutDate: lastWorkout?.data ?? null,
  };
}
