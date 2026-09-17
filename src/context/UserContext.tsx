import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { applyWorkoutProgression } from '../utils/progression';
import { getWorkoutPlans } from '../data/workouts';
import {
  ActiveWorkoutDraft,
  ExperienceLevel,
  OnboardingProfile,
  User,
  WorkoutPost,
  WorkoutRecord,
  WorkoutSplit,
} from '../types/models';
import {
  isStoredActiveWorkoutDraft,
  isStoredArray,
  isStoredUser,
  isStoredWorkoutPost,
  isStoredWorkoutRecord,
  safeParseStoredValue,
} from '../utils/storageValidation';

const USER_STORAGE_KEY = '@ironlog/user';
const RECORDS_STORAGE_KEY = '@ironlog/workout-records';
const POSTS_STORAGE_KEY = '@ironlog/workout-posts';
const ACTIVE_WORKOUT_STORAGE_KEY = '@ironlog/active-workout';

interface DraftUser {
  nome?: string;
  sobrenome?: string;
  idade?: number;
  altura?: number;
  peso?: number;
  fotoUri?: string;
}

interface UserContextValue {
  user: User | null;
  records: WorkoutRecord[];
  workoutPosts: WorkoutPost[];
  activeWorkoutDraft: ActiveWorkoutDraft | null;
  draftUser: DraftUser;
  isLoading: boolean;
  setDraftUser: (data: DraftUser) => void;
  finishOnboarding: {
    (level: ExperienceLevel, workoutSplit: WorkoutSplit): Promise<void>;
    (profile: OnboardingProfile): Promise<void>;
  };
  updateUserProfile: (data: Partial<Pick<User, 'nome' | 'sobrenome' | 'altura' | 'peso' | 'metaPeso' | 'fotoUri'>>) => Promise<void>;
  updateTrainingPreferences: (data: Pick<User, 'nivelAtual' | 'workoutSplit'>) => Promise<void>;
  saveActiveWorkoutDraft: (draft: ActiveWorkoutDraft) => Promise<void>;
  clearActiveWorkoutDraft: () => Promise<void>;
  resetAccount: () => Promise<void>;
  completeWorkout: (
    records: Omit<WorkoutRecord, 'id' | 'data' | 'durationSeconds' | 'workoutTitle'>[],
    meta: { durationSeconds: number; workoutTitle: string; photoUri?: string; sessionId?: string },
  ) => Promise<{ user: User; completedAt: string } | null>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [workoutPosts, setWorkoutPosts] = useState<WorkoutPost[]>([]);
  const [activeWorkoutDraft, setActiveWorkoutDraft] = useState<ActiveWorkoutDraft | null>(null);
  const [draftUser, updateDraftUser] = useState<DraftUser>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const [storedUser, storedRecords, storedPosts, storedActiveWorkout] = await Promise.all([
          AsyncStorage.getItem(USER_STORAGE_KEY),
          AsyncStorage.getItem(RECORDS_STORAGE_KEY),
          AsyncStorage.getItem(POSTS_STORAGE_KEY),
          AsyncStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY),
        ]);

        const parsedUser = safeParseStoredValue(storedUser, null as User | null, isStoredUser);
        const parsedRecords = safeParseStoredValue(storedRecords, [] as WorkoutRecord[], (value): value is WorkoutRecord[] =>
          isStoredArray(value, isStoredWorkoutRecord),
        );
        const parsedPosts = safeParseStoredValue(storedPosts, [] as WorkoutPost[], (value): value is WorkoutPost[] =>
          isStoredArray(value, isStoredWorkoutPost),
        );
        const parsedActiveWorkout = safeParseStoredValue(storedActiveWorkout, null as ActiveWorkoutDraft | null, isStoredActiveWorkoutDraft);

        if (parsedUser) {
          setUser({
            ...parsedUser,
            workoutSplit: parsedUser.workoutSplit ?? 'normal',
            activeWorkoutIndex: parsedUser.activeWorkoutIndex ?? 0,
            completedDaysInLevel: parsedUser.completedDaysInLevel ?? 0,
          });
        }

        setRecords(parsedRecords);
        setWorkoutPosts(parsedPosts);
        setActiveWorkoutDraft(parsedActiveWorkout);
      } finally {
        setIsLoading(false);
      }
    }

    hydrate();
  }, []);

  const setDraftUser = useCallback((data: DraftUser) => {
    updateDraftUser((current) => ({ ...current, ...data }));
  }, []);

  const finishOnboarding = useCallback(
    async (profileOrLevel: OnboardingProfile | ExperienceLevel, selectedWorkoutSplit?: WorkoutSplit) => {
      const profile = typeof profileOrLevel === 'string' ? null : profileOrLevel;
      const level = typeof profileOrLevel === 'string' ? profileOrLevel : profileOrLevel.nivelAtual;
      const workoutSplit = typeof profileOrLevel === 'string' ? selectedWorkoutSplit ?? 'normal' : profileOrLevel.workoutSplit;
      const nextUser: User = {
        id: createId('user'),
        nome: profile?.nome.trim() ?? draftUser.nome?.trim() ?? '',
        sobrenome: profile?.sobrenome.trim() ?? draftUser.sobrenome?.trim() ?? '',
        idade: profile?.idade ?? draftUser.idade ?? 0,
        altura: profile?.altura ?? draftUser.altura ?? 0,
        peso: profile?.peso ?? draftUser.peso ?? 0,
        fotoUri: profile?.fotoUri ?? draftUser.fotoUri,
        genero: profile?.genero,
        experienciaTreino: profile?.experienciaTreino,
        frequenciaAtual: profile?.frequenciaAtual,
        objetivoAtual: profile?.objetivoAtual,
        localTreino: profile?.localTreino,
        focoCorpo: profile?.focoCorpo,
        metaPeso: profile?.metaPeso,
        diasTreinoSemana: profile?.diasTreinoSemana,
        duracaoTreino: profile?.duracaoTreino,
        modoPlano: profile?.modoPlano,
        nivelAtual: level,
        workoutSplit,
        dataInicioNivel: new Date().toISOString(),
        completedDaysInLevel: 0,
        activeWorkoutIndex: 0,
      };

      setUser(nextUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    },
    [draftUser],
  );

  const updateUserProfile = useCallback(
    async (data: Partial<Pick<User, 'nome' | 'sobrenome' | 'altura' | 'peso' | 'metaPeso' | 'fotoUri'>>) => {
      if (!user) {
        return;
      }

      const nextUser = { ...user, ...data };
      setUser(nextUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    },
    [user],
  );

  const updateTrainingPreferences = useCallback(
    async (data: Pick<User, 'nivelAtual' | 'workoutSplit'>) => {
      if (!user) {
        return;
      }

      const levelChanged = data.nivelAtual !== user.nivelAtual;
      const nextUser: User = {
        ...user,
        ...data,
        dataInicioNivel: levelChanged ? new Date().toISOString() : user.dataInicioNivel,
        completedDaysInLevel: levelChanged ? 0 : user.completedDaysInLevel,
        activeWorkoutIndex: 0,
      };

      setUser(nextUser);
      await Promise.all([
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser)),
        AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY),
      ]);
    },
    [user],
  );

  const saveActiveWorkoutDraft = useCallback(async (draft: ActiveWorkoutDraft) => {
    const nextDraft = { ...draft, updatedAt: new Date().toISOString() };
    setActiveWorkoutDraft(nextDraft);
    await AsyncStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(nextDraft));
  }, []);

  const clearActiveWorkoutDraft = useCallback(async () => {
    setActiveWorkoutDraft(null);
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  }, []);

  const resetAccount = useCallback(async () => {
    setUser(null);
    setRecords([]);
    setWorkoutPosts([]);
    setActiveWorkoutDraft(null);
    updateDraftUser({});
    await Promise.all([
      AsyncStorage.removeItem(USER_STORAGE_KEY),
      AsyncStorage.removeItem(RECORDS_STORAGE_KEY),
      AsyncStorage.removeItem(POSTS_STORAGE_KEY),
      AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY),
    ]);
  }, []);

  const completeWorkout = useCallback(
    async (
      workoutPayload: Omit<WorkoutRecord, 'id' | 'data' | 'durationSeconds' | 'workoutTitle'>[],
      meta: { durationSeconds: number; workoutTitle: string; photoUri?: string; sessionId?: string },
    ) => {
      if (!user) {
        return null;
      }

      const duplicate = meta.sessionId ? workoutPosts.find((post) => post.sessionId === meta.sessionId) : null;
      if (duplicate) {
        return { user, completedAt: duplicate.data };
      }

      const date = new Date().toISOString();
      const nextRecords = [
        ...records,
        ...workoutPayload.map((record) => ({
          ...record,
          id: createId('record'),
          sessionId: meta.sessionId,
          data: date,
          workoutTitle: meta.workoutTitle,
          durationSeconds: meta.durationSeconds,
        })),
      ];
      const totalVolumeKg = workoutPayload.reduce(
        (sum, record) =>
          sum +
          (record.volumeKg ??
            (record.sets?.reduce((setSum, set) => setSum + set.cargaKg * set.repeticoes, 0) ??
              record.cargaKg * record.series * record.repeticoes)),
        0,
      );
      const totalReps = workoutPayload.reduce(
        (sum, record) =>
          sum + (record.totalReps ?? record.sets?.reduce((setSum, set) => setSum + set.repeticoes, 0) ?? record.series * record.repeticoes),
        0,
      );
      const nextPost: WorkoutPost = {
        id: createId('post'),
        sessionId: meta.sessionId,
        data: date,
        workoutTitle: meta.workoutTitle,
        durationSeconds: meta.durationSeconds,
        photoUri: meta.photoUri,
        exercisesCount: workoutPayload.length,
        totalVolumeKg,
        totalReps,
        calories: Math.round((meta.durationSeconds / 60) * 6),
      };
      const nextPosts = [nextPost, ...workoutPosts];
      const progressedUser = applyWorkoutProgression(user);
      const levelChanged = progressedUser.nivelAtual !== user.nivelAtual;
      const planCount = getWorkoutPlans(progressedUser.nivelAtual, progressedUser.workoutSplit ?? 'normal').length || 1;
      const nextUser = {
        ...progressedUser,
        activeWorkoutIndex: levelChanged ? 0 : (user.activeWorkoutIndex + 1) % planCount,
      };

      await Promise.all([
        AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(nextRecords)),
        AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(nextPosts)),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser)),
        AsyncStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY),
      ]);

      setRecords(nextRecords);
      setWorkoutPosts(nextPosts);
      setUser(nextUser);
      setActiveWorkoutDraft(null);

      return { user: nextUser, completedAt: date };
    },
    [records, user, workoutPosts],
  );

  const value = useMemo(
    () => ({
      user,
      records,
      workoutPosts,
      activeWorkoutDraft,
      draftUser,
      isLoading,
      setDraftUser,
      finishOnboarding,
      updateUserProfile,
      updateTrainingPreferences,
      saveActiveWorkoutDraft,
      clearActiveWorkoutDraft,
      resetAccount,
      completeWorkout,
    }),
    [
      activeWorkoutDraft,
      clearActiveWorkoutDraft,
      completeWorkout,
      draftUser,
      finishOnboarding,
      isLoading,
      records,
      resetAccount,
      saveActiveWorkoutDraft,
      setDraftUser,
      updateTrainingPreferences,
      updateUserProfile,
      user,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used inside UserProvider');
  }

  return context;
}
