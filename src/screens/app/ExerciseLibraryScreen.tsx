import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar, bottomTabPadding } from '../../components/navigation/BottomTabBar';
import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { getWorkoutPlans, workoutPlansBySplit } from '../../data/workouts';
import { ExperienceLevel, WorkoutSplit } from '../../types/models';
import { RootStackParamList } from '../../types/navigation';
import { getExerciseEquipment, muscleLibrary, normalizeMuscleName } from '../../utils/exercisePresentation';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseLibrary'>;
type LibraryTab = 'muscle' | 'equipment' | 'favorites';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface LibraryExercise {
  key: string;
  name: string;
  muscle: string;
  equipment: string;
  suggestedSeries: number;
  suggestedReps: number;
  defaultKg: number;
  sourceCount: number;
  route: RootStackParamList['ExerciseDetail'];
  sourceLabel: string;
}

const tabs: Array<{ key: LibraryTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'muscle', label: 'Por músculo', icon: 'body-outline' },
  { key: 'equipment', label: 'Equipamentos', icon: 'barbell-outline' },
  { key: 'favorites', label: 'Favoritos', icon: 'star-outline' },
];

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isLowerBody(muscle: string) {
  const key = normalizeKey(muscle);
  return ['pernas', 'quadriceps', 'posterior', 'panturrilha', 'gluteos'].some((item) => key.includes(item));
}

function exerciseMatchesMuscle(exerciseMuscle: string, muscleLabel: string) {
  const exerciseKey = normalizeKey(normalizeMuscleName(exerciseMuscle));
  const muscleKey = normalizeKey(normalizeMuscleName(muscleLabel));

  if (muscleKey === 'pernas') {
    return isLowerBody(exerciseKey);
  }

  return exerciseKey.includes(muscleKey) || muscleKey.includes(exerciseKey);
}

function buildAllLibraryExercises() {
  const levels: ExperienceLevel[] = ['iniciante', 'regular', 'profissional'];
  const splits: WorkoutSplit[] = ['normal', 'fullBody'];
  const byName = new Map<string, LibraryExercise>();

  splits.forEach((split) => {
    levels.forEach((level) => {
      const plans = workoutPlansBySplit[split][level];

      plans.forEach((plan, workoutIndex) => {
        plan.exercises.forEach((exercise) => {
          const muscle = normalizeMuscleName(exercise.grupoMuscular);
          const key = `${normalizeKey(exercise.nome)}-${normalizeKey(muscle)}`;
          const existing = byName.get(key);

          if (existing) {
            existing.sourceCount += 1;
            return;
          }

          byName.set(key, {
            key,
            name: exercise.nome,
            muscle,
            equipment: getExerciseEquipment(exercise.nome),
            suggestedSeries: exercise.suggestedSeries,
            suggestedReps: exercise.suggestedReps,
            defaultKg: exercise.defaultKg,
            sourceCount: 1,
            sourceLabel: `${plan.dayLabel} · ${plan.title}`,
            route: {
              level,
              workoutSplit: split,
              workoutIndex,
              exerciseId: exercise.id,
            },
          });
        });
      });
    });
  });

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function ExerciseLibraryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useUser();
  const fade = useRef(new Animated.Value(1)).current;
  const [activeTab, setActiveTab] = useState<LibraryTab>('muscle');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const allExercises = useMemo(() => buildAllLibraryExercises(), []);
  const userPlanCount = useMemo(() => {
    if (!user) {
      return 0;
    }

    return getWorkoutPlans(user.nivelAtual, user.workoutSplit ?? 'normal').length;
  }, [user]);
  const visibleMuscles = useMemo(
    () =>
      muscleLibrary
        .map((item) => {
          const exercises = allExercises.filter((exercise) => exerciseMatchesMuscle(exercise.muscle, item.label));
          return { ...item, count: exercises.length };
        })
        .filter((item) => item.count > 0),
    [allExercises],
  );
  const selectedExercises = useMemo(
    () => (selectedMuscle ? allExercises.filter((exercise) => exerciseMatchesMuscle(exercise.muscle, selectedMuscle)) : []),
    [allExercises, selectedMuscle],
  );
  const equipmentGroups = useMemo(() => {
    const groups = new Map<string, LibraryExercise[]>();

    allExercises.forEach((exercise) => {
      const current = groups.get(exercise.equipment) ?? [];
      current.push(exercise);
      groups.set(exercise.equipment, current);
    });

    return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [allExercises]);

  function animateContentChange() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    fade.setValue(0.45);
    Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }

  function changeTab(tab: LibraryTab) {
    if (tab === activeTab) {
      return;
    }

    animateContentChange();
    setActiveTab(tab);
    setSelectedMuscle(null);
  }

  function openMuscle(label: string) {
    animateContentChange();
    setSelectedMuscle(label);
  }

  function closeMuscle() {
    animateContentChange();
    setSelectedMuscle(null);
  }

  function openExercise(exercise: LibraryExercise) {
    navigation.navigate('ExerciseDetail', exercise.route);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Biblioteca</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Exercícios</Text>
          </View>
          <View style={[styles.planPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="albums-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.planPillText, { color: theme.colors.textMuted }]}>{userPlanCount || 0} dias no seu plano</Text>
          </View>
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.colors.surface }]}>
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;

            return (
              <Pressable key={tab.key} onPress={() => changeTab(tab.key)} style={[styles.segment, selected ? styles.segmentSelected : null]}>
                <Ionicons name={tab.icon} size={15} color={selected ? '#081018' : theme.colors.textMuted} />
                <Text style={[styles.segmentText, { color: selected ? '#081018' : theme.colors.text }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View style={{ opacity: fade }}>
          {activeTab === 'muscle' && !selectedMuscle ? (
            <View style={styles.list}>
              {visibleMuscles.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => openMuscle(item.label)}
                  style={({ pressed }) => [
                    styles.muscleRow,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
                  ]}
                >
                  <MuscleDiagram label={item.label} />
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>{item.label}</Text>
                    <Text style={[styles.count, { color: theme.colors.textMuted }]}>{item.count} exercícios disponíveis</Text>
                  </View>
                  <View style={[styles.chevronBubble, { backgroundColor: theme.colors.surfaceElevated }]}>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          {activeTab === 'muscle' && selectedMuscle ? (
            <View style={styles.detailPanel}>
              <Pressable onPress={closeMuscle} style={styles.backRow}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
                <Text style={[styles.backText, { color: theme.colors.primary }]}>Músculos</Text>
              </Pressable>

              <View style={[styles.selectedHeader, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <MuscleDiagram label={selectedMuscle} size="large" />
                <View style={styles.copy}>
                  <Text style={[styles.selectedTitle, { color: theme.colors.text }]}>{selectedMuscle}</Text>
                  <Text style={[styles.selectedSubtitle, { color: theme.colors.textMuted }]}>
                    {selectedExercises.length} exercícios encontrados nos planos do IronLog.
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {selectedExercises.map((exercise) => (
                  <ExerciseLibraryCard key={exercise.key} exercise={exercise} onPress={() => openExercise(exercise)} />
                ))}
              </View>
            </View>
          ) : null}

          {activeTab === 'equipment' ? (
            <View style={styles.equipmentGrid}>
              {equipmentGroups.map(([equipment, exercises]) => (
                <View key={equipment} style={[styles.equipmentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[styles.equipmentIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
                    <Ionicons name="barbell-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.equipmentTitle, { color: theme.colors.text }]}>{equipment}</Text>
                  <Text style={[styles.count, { color: theme.colors.textMuted }]}>{exercises.length} exercícios</Text>
                  <View style={styles.previewStack}>
                    {exercises.slice(0, 3).map((exercise) => (
                      <Text key={exercise.key} numberOfLines={1} style={[styles.previewText, { color: theme.colors.textMuted }]}>
                        {exercise.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {activeTab === 'favorites' ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="star-outline" size={30} color={theme.colors.primary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Favoritos em breve</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                A tela já está preparada para guardar os exercícios preferidos quando o favorito for ativado.
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
      <BottomTabBar active="ExerciseLibrary" />
    </SafeAreaView>
  );
}

function ExerciseLibraryCard({ exercise, onPress }: { exercise: LibraryExercise; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <MuscleDiagram label={exercise.muscle} />
      <View style={styles.copy}>
        <View style={styles.cardTopline}>
          <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{exercise.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
        <Text style={[styles.exerciseMeta, { color: theme.colors.textMuted }]}>
          {exercise.suggestedSeries} sets · {exercise.suggestedReps} reps · {exercise.defaultKg} kg
        </Text>
        <Text style={[styles.exerciseSource, { color: theme.colors.primary }]} numberOfLines={1}>
          {exercise.sourceLabel} · aparece em {exercise.sourceCount} treino{exercise.sourceCount > 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 14,
    paddingBottom: bottomTabPadding,
    gap: 18,
  },
  header: {
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  planPill: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  segmented: {
    minHeight: 50,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  segmentSelected: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  list: {
    gap: 10,
  },
  muscleRow: {
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
  },
  chevronBubble: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPanel: {
    gap: 14,
  },
  backRow: {
    alignSelf: 'flex-start',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  selectedHeader: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  selectedTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  selectedSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  exerciseMeta: {
    fontSize: 12,
    fontWeight: '800',
  },
  exerciseSource: {
    fontSize: 11,
    fontWeight: '900',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentCard: {
    width: '48.5%',
    minHeight: 178,
    borderRadius: 8,
    borderWidth: 1,
    padding: 13,
    gap: 8,
  },
  equipmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  previewStack: {
    gap: 5,
    paddingTop: 3,
  },
  previewText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
