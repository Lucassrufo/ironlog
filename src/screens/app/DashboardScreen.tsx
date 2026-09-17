import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components/ui/AppButton';
import { BottomTabBar, bottomTabPadding } from '../../components/navigation/BottomTabBar';
import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { RootStackParamList } from '../../types/navigation';
import { WorkoutExercise, WorkoutPlan } from '../../types/models';
import { getTargetMuscles, normalizeMuscleName } from '../../utils/exercisePresentation';
import { levelContent } from '../../data/levels';
import { limitPlansForUser } from '../../utils/planPreferences';
import { mapAssignedRoutineToWorkoutPlans } from '../../services/platform/platformMappers';
import { getActiveAssignedRoutine } from '../../services/platform/routineService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getWorkoutPlans, workoutSplitContent } from '../../data/workouts';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function secondsSince(startedAt: number) {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export function DashboardScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { isConfigured, platformProfile } = useAuth();
  const { user } = useUser();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [assignedPlans, setAssignedPlans] = useState<WorkoutPlan[]>([]);
  const [assignmentMeta, setAssignmentMeta] = useState<Record<string, { trainerId: string; routineId: string; routineDayId: string }>>({});

  const workoutSplit = user?.workoutSplit ?? 'normal';
  const localPlans = useMemo(() => (user ? limitPlansForUser(getWorkoutPlans(user.nivelAtual, workoutSplit), user) : []), [user, workoutSplit]);
  const plans = assignedPlans.length > 0 ? assignedPlans : localPlans;
  const displayedPlans = useMemo(() => plans.slice(0, 6), [plans]);
  const selectedPlan = displayedPlans[selectedPlanIndex] ?? displayedPlans[0] ?? null;
  const exercises = selectedPlan?.exercises ?? [];
  const targetMuscles = useMemo(() => getTargetMuscles(exercises, 2), [exercises]);
  const planMusclesTitle = useMemo(() => {
    const muscles = getTargetMuscles(exercises, 3);

    if (muscles.length === 0) {
      return selectedPlan?.title ?? 'Treino do dia';
    }

    return `Treino de ${muscles.join(', ')}`;
  }, [exercises, selectedPlan?.title]);

  useEffect(() => {
    if (!user || displayedPlans.length === 0) {
      return;
    }

    const requestedIndex = route.params?.initialWorkoutIndex;
    setSelectedPlanIndex(Math.min(requestedIndex ?? user.activeWorkoutIndex ?? 0, displayedPlans.length - 1));
  }, [displayedPlans.length, route.params?.initialWorkoutIndex, user]);

  useEffect(() => {
    if (!isConfigured || platformProfile?.role !== 'student') {
      return;
    }

    getActiveAssignedRoutine(platformProfile.id)
      .then((assignment) => {
        if (!assignment) {
          setAssignedPlans([]);
          setAssignmentMeta({});
          return;
        }

        setAssignedPlans(mapAssignedRoutineToWorkoutPlans(assignment));
        setAssignmentMeta(
          assignment.routine.days.reduce<Record<string, { trainerId: string; routineId: string; routineDayId: string }>>((acc, day) => {
            acc[`remote-${day.id}`] = {
              trainerId: assignment.trainerId,
              routineId: assignment.routine.id,
              routineDayId: day.id,
            };
            return acc;
          }, {}),
        );
      })
      .catch((error) => {
        Alert.alert('Treino online indisponivel', error instanceof Error ? error.message : 'Usando treino local por enquanto.');
      });
  }, [isConfigured, platformProfile]);

  if (!user) {
    return null;
  }

  const currentUser = user;

  function navigateToExercise(exercise: WorkoutExercise) {
    navigation.navigate('ExerciseDetail', {
      level: currentUser.nivelAtual,
      workoutSplit,
      workoutIndex: selectedPlanIndex,
      exerciseId: exercise.id,
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('TrainingPreferences')}
            style={({ pressed }) => [
              styles.planButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Ionicons name="barbell-outline" size={18} color={theme.colors.text} />
            <Text style={[styles.planButtonText, { color: theme.colors.text }]}>Meu plano</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('WorkoutSchedule')}
            style={({ pressed }) => [
              styles.scheduleButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
          {displayedPlans.map((plan, index) => {
            const selected = selectedPlanIndex === index;

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlanIndex(index)}
                style={[
                  styles.dayTab,
                  selected
                    ? { backgroundColor: theme.colors.surfaceElevated }
                    : { backgroundColor: 'transparent', borderColor: 'transparent' },
                ]}
              >
                <Text style={[styles.dayTabText, { color: selected ? theme.colors.text : theme.colors.textMuted }]}>
                  Dia {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.kicker, { color: theme.colors.text }]}>
            Dia {selectedPlanIndex + 1} | Configurações de treino
          </Text>
          <View style={[styles.workoutFocusCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.workoutFocusIcon, { backgroundColor: theme.colors.input }]}>
              <Ionicons name="flash-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.workoutFocusCopy}>
              <Text style={[styles.workoutFocusTitle, { color: theme.colors.text }]}>{planMusclesTitle}</Text>
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {selectedPlan?.title ?? 'Treino'} · {levelContent[user.nivelAtual].title} · {workoutSplitContent[workoutSplit].title}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.kicker, { color: theme.colors.text }]}>Músculos alvo</Text>
          <View style={styles.targetRow}>
            {targetMuscles.map((muscle) => (
              <View key={muscle} style={[styles.targetCard, { backgroundColor: theme.colors.surface }]}>
                <MuscleDiagram label={muscle} />
                <Text style={[styles.targetText, { color: theme.colors.textMuted }]}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.exerciseHeader}>
          <Text style={[styles.kicker, { color: theme.colors.text }]}>{exercises.length} exercícios</Text>
        </View>

        <View style={styles.exerciseList}>
          {exercises.map((exercise, index) => (
            <ExercisePlanRow
              key={exercise.id}
              exercise={exercise}
              index={index}
              onPress={() => navigateToExercise(exercise)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.startButton}>
        <AppButton
          label="Iniciar treino"
          icon="play"
          onPress={() =>
            navigation.navigate('ActiveWorkout', {
              level: currentUser.nivelAtual,
              workoutSplit,
              workoutIndex: selectedPlanIndex,
              customWorkout: selectedPlan ?? undefined,
              assignmentMeta: selectedPlan ? assignmentMeta[selectedPlan.id] : undefined,
            })
          }
        />
      </View>
      <BottomTabBar active="Dashboard" />
    </SafeAreaView>
  );
}

function ExercisePlanRow({
  exercise,
  index,
  onPress,
}: {
  exercise: WorkoutExercise;
  index: number;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const isSuperSet = index === 1;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseRow,
        { borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={styles.exerciseArt}>
        <ExerciseThumbnail muscle={normalizeMuscleName(exercise.grupoMuscular)} />
      </View>
      <View style={styles.exerciseCopy}>
        {isSuperSet ? (
          <View style={[styles.superBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.superBadgeText, { color: theme.colors.primarySoft }]}>Super série 1/2</Text>
          </View>
        ) : null}
        <Text style={[styles.exerciseName, { color: theme.colors.text }]} numberOfLines={2}>
          {exercise.nome}
        </Text>
        <Text style={[styles.exerciseMeta, { color: theme.colors.textMuted }]}>
          {exercise.suggestedSeries} sets · {exercise.suggestedReps} reps · {exercise.defaultKg} kg
        </Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

function ExerciseThumbnail({ muscle }: { muscle: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceElevated }]}>
      <View style={[styles.thumbnailBar, { backgroundColor: theme.colors.textMuted }]} />
      <View style={[styles.thumbnailPlate, styles.thumbnailPlateLeft, { backgroundColor: theme.colors.textMuted }]} />
      <View style={[styles.thumbnailPlate, styles.thumbnailPlateRight, { backgroundColor: theme.colors.textMuted }]} />
      <View style={[styles.thumbnailBench, { backgroundColor: theme.colors.border }]} />
      <View style={styles.thumbnailBody}>
        <MuscleDiagram label={muscle} />
      </View>
      <View style={[styles.thumbnailGlow, { backgroundColor: theme.colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 6,
    paddingTop: 20,
    paddingBottom: bottomTabPadding + 92,
    gap: 22,
  },
  topbar: {
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planButton: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  scheduleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabs: {
    gap: 12,
    paddingRight: 8,
  },
  dayTab: {
    minWidth: 56,
    minHeight: 50,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  dayTabText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    opacity: 0.72,
  },
  sectionHeader: {
    gap: 12,
  },
  workoutFocusCard: {
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutFocusIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutFocusCopy: {
    flex: 1,
    gap: 4,
  },
  workoutFocusTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetCard: {
    width: 80,
    minHeight: 78,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseList: {
    gap: 0,
  },
  exerciseRow: {
    minHeight: 106,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  exerciseArt: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailBar: {
    position: 'absolute',
    width: 58,
    height: 4,
    borderRadius: 4,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.75,
  },
  thumbnailPlate: {
    position: 'absolute',
    width: 11,
    height: 26,
    borderRadius: 5,
    opacity: 0.72,
  },
  thumbnailPlateLeft: {
    left: 8,
    top: 22,
  },
  thumbnailPlateRight: {
    right: 8,
    top: 22,
  },
  thumbnailBench: {
    position: 'absolute',
    bottom: 13,
    width: 54,
    height: 7,
    borderRadius: 6,
    opacity: 0.84,
  },
  thumbnailBody: {
    transform: [{ scale: 0.78 }],
  },
  thumbnailGlow: {
    position: 'absolute',
    right: -14,
    bottom: -14,
    width: 42,
    height: 42,
    borderRadius: 21,
    opacity: 0.18,
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  superBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  superBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  exerciseMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPill: {
    position: 'absolute',
    left: 24,
    bottom: 154,
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '900',
  },
  startButton: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 84,
  },
});
