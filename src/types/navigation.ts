import { ExperienceLevel, WorkoutPlan, WorkoutSplit } from './models';

export type OnboardingStackParamList = {
  OnboardingFlow: undefined;
  PersonalInfo: undefined;
  BodyMetrics: undefined;
  BmiResult: undefined;
  LevelSelection: undefined;
  WorkoutSplitSelection: {
    level: ExperienceLevel;
  };
};

export type RootStackParamList = {
  Onboarding: undefined;
  SupabaseSetup: undefined;
  AuthLoading: undefined;
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
  CompleteOAuthProfile: undefined;
  TrainerDashboard: undefined;
  TrainerStudents: undefined;
  TrainerStudentDetail: {
    studentId: string;
  };
  TrainerRoutines: undefined;
  TrainerRoutineEditor: {
    routineId?: string;
  } | undefined;
  StudentPortal: undefined;
  PlatformChat: {
    threadId?: string;
    studentId?: string;
  } | undefined;
  Dashboard: { initialWorkoutIndex?: number } | undefined;
  TrainingHub: undefined;
  Progress: undefined;
  ExerciseLibrary: undefined;
  ActiveWorkout: {
    level: ExperienceLevel;
    workoutSplit: WorkoutSplit;
    workoutIndex: number;
    customWorkout?: WorkoutPlan;
    assignmentMeta?: {
      trainerId: string;
      routineId: string;
      routineDayId: string;
    };
  };
  WorkoutComplete: {
    completedAt: string;
  };
  ExerciseDetail: {
    level: ExperienceLevel;
    workoutSplit: WorkoutSplit;
    workoutIndex: number;
    exerciseId: string;
  };
  Profile: undefined;
  TrainingPreferences: undefined;
  WorkoutSummary: {
    completedAt: string;
  };
  WorkoutSchedule: undefined;
};
