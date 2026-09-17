export type ExperienceLevel = 'iniciante' | 'regular' | 'profissional';
export type WorkoutSplit = 'normal' | 'fullBody';
export type GenderIdentity = 'masculino' | 'feminino' | 'outro';
export type TrainingExperience = 'iniciante' | 'intermediario' | 'avancado';
export type CurrentTrainingFrequency = 'regularmente' | 'inconsistente' | 'nunca';
export type FitnessGoal = 'conditioning' | 'strength' | 'definition' | 'muscle';
export type TrainingLocation = 'large_gym' | 'small_gym' | 'home_gym' | 'bodyweight';
export type BodyFocus = 'full_body' | 'shoulders' | 'arms' | 'chest' | 'core' | 'back' | 'glutes' | 'legs';
export type SessionDuration = 'quick' | 'short' | 'medium' | 'long';
export type PlanMode = 'smart' | 'manual';
export type ExerciseExecutionMode = 'bilateral' | 'unilateral';
export type ExerciseMeasureType = 'reps' | 'duration' | 'distance';

export interface OnboardingProfile {
  nome: string;
  sobrenome: string;
  idade: number;
  altura: number;
  peso: number;
  fotoUri?: string;
  genero: GenderIdentity;
  experienciaTreino: TrainingExperience;
  frequenciaAtual: CurrentTrainingFrequency;
  objetivoAtual: FitnessGoal;
  localTreino: TrainingLocation;
  focoCorpo: BodyFocus;
  metaPeso: number;
  diasTreinoSemana: number;
  duracaoTreino: SessionDuration;
  modoPlano: PlanMode;
  nivelAtual: ExperienceLevel;
  workoutSplit: WorkoutSplit;
}

export interface User {
  id: string;
  nome: string;
  sobrenome: string;
  idade: number;
  altura: number;
  peso: number;
  fotoUri?: string;
  genero?: GenderIdentity;
  experienciaTreino?: TrainingExperience;
  frequenciaAtual?: CurrentTrainingFrequency;
  objetivoAtual?: FitnessGoal;
  localTreino?: TrainingLocation;
  focoCorpo?: BodyFocus;
  metaPeso?: number;
  diasTreinoSemana?: number;
  duracaoTreino?: SessionDuration;
  modoPlano?: PlanMode;
  nivelAtual: ExperienceLevel;
  workoutSplit: WorkoutSplit;
  dataInicioNivel: string;
  completedDaysInLevel: number;
  activeWorkoutIndex: number;
}

export interface Exercise {
  id: string;
  nome: string;
  grupoMuscular: string;
  icone: string;
  videoUrl: string;
  youtubeUrl: string;
  descricao: string;
}

export interface WorkoutRecord {
  id: string;
  sessionId?: string;
  exerciseId: string;
  exerciseName: string;
  workoutTitle: string;
  series: number;
  repeticoes: number;
  cargaKg: number;
  sets?: WorkoutSetRecord[];
  executionMode?: ExerciseExecutionMode;
  measureType?: ExerciseMeasureType;
  note?: string;
  volumeKg?: number;
  totalReps?: number;
  workSeconds?: number;
  durationSeconds: number;
  data: string;
}

export interface WorkoutSetRecord {
  setNumber: number;
  repeticoes: number;
  cargaKg: number;
  completed: boolean;
}

export interface WorkoutPost {
  id: string;
  sessionId?: string;
  data: string;
  workoutTitle: string;
  durationSeconds: number;
  photoUri?: string;
  exercisesCount: number;
  totalVolumeKg: number;
  totalReps: number;
  calories: number;
}

export interface ActiveWorkoutExerciseState {
  exerciseId: string;
  mode: ExerciseExecutionMode;
  sets: WorkoutSetRecord[];
  note: string;
}

export interface ActiveWorkoutDraft {
  sessionId: string;
  level: ExperienceLevel;
  workoutSplit: WorkoutSplit;
  workoutIndex: number;
  workoutTitle: string;
  startedAt: number;
  elapsedSeconds: number;
  currentIndex: number;
  photoUri?: string;
  updatedAt: string;
  exercises: Record<string, ActiveWorkoutExerciseState>;
}

export interface WorkoutExercise extends Exercise {
  suggestedSeries: number;
  suggestedReps: number;
  defaultKg: number;
}

export interface WorkoutPlan {
  id: string;
  dayLabel: string;
  weekDay: number;
  title: string;
  focus: string;
  exercises: WorkoutExercise[];
}
