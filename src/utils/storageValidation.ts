export function safeParseStoredValue<T>(
  raw: string | null,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isStoredArray<T>(value: unknown, validateItem: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(validateItem);
}

export function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === 'string';
}

export function hasNumber(value: Record<string, unknown>, key: string) {
  return typeof value[key] === 'number' && Number.isFinite(value[key]);
}

export function isStoredUser(value: unknown): value is import('../types/models').User {
  return isObject(value) && hasString(value, 'id') && hasString(value, 'nome') && hasString(value, 'nivelAtual');
}

export function isStoredWorkoutRecord(value: unknown): value is import('../types/models').WorkoutRecord {
  return isObject(value) && hasString(value, 'id') && hasString(value, 'exerciseId') && hasString(value, 'data');
}

export function isStoredWorkoutPost(value: unknown): value is import('../types/models').WorkoutPost {
  return isObject(value) && hasString(value, 'id') && hasString(value, 'data') && hasString(value, 'workoutTitle');
}

export function isStoredActiveWorkoutDraft(value: unknown): value is import('../types/models').ActiveWorkoutDraft {
  return isObject(value) && hasString(value, 'sessionId') && hasNumber(value, 'startedAt') && typeof value.exercises === 'object' && value.exercises !== null;
}
