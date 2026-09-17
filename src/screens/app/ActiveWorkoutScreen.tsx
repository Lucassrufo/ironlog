import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components/ui/AppButton';
import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { RootStackParamList } from '../../types/navigation';
import { ActiveWorkoutExerciseState, ExerciseExecutionMode, WorkoutExercise, WorkoutSetRecord } from '../../types/models';
import { formatDuration } from './DashboardScreen';
import { normalizeMuscleName } from '../../utils/exercisePresentation';
import { getWorkoutPlans } from '../../data/workouts';
import { calculateWorkoutTotals, createSessionRecords } from '../../utils/workoutMetrics';
import { mapWorkoutRecordsToSessionPayload } from '../../services/platform/platformMappers';
import { syncWorkoutSession } from '../../services/platform/sessionSyncService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveWorkout'>;

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface EditingSet {
  exerciseId: string;
  setIndex: number;
}

function createInitialExerciseState(exercise: WorkoutExercise, previousSets?: WorkoutSetRecord[]): ActiveWorkoutExerciseState {
  const completedPreviousSets = previousSets?.filter((set) => set.completed);
  const lastSet = completedPreviousSets?.[completedPreviousSets.length - 1];

  return {
    exerciseId: exercise.id,
    mode: 'bilateral',
    note: '',
    sets: Array.from({ length: exercise.suggestedSeries }, (_, index) => ({
      setNumber: index + 1,
      repeticoes: lastSet?.repeticoes ?? exercise.suggestedReps,
      cargaKg: lastSet?.cargaKg ?? exercise.defaultKg,
      completed: false,
    })),
  };
}

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function animateExerciseLayout() {
  LayoutAnimation.configureNext({
    duration: 320,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.86,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

export function ActiveWorkoutScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { isConfigured, platformProfile } = useAuth();
  const { activeWorkoutDraft, clearActiveWorkoutDraft, completeWorkout, records, saveActiveWorkoutDraft } = useUser();
  const workout = route.params.customWorkout ?? getWorkoutPlans(route.params.level, route.params.workoutSplit)?.[route.params.workoutIndex];
  const exercises = useMemo(() => workout?.exercises ?? [], [workout]);
  const matchingDraft =
    activeWorkoutDraft &&
    activeWorkoutDraft.level === route.params.level &&
    activeWorkoutDraft.workoutSplit === route.params.workoutSplit &&
    activeWorkoutDraft.workoutIndex === route.params.workoutIndex
      ? activeWorkoutDraft
      : null;
  const [sessionId] = useState(() => matchingDraft?.sessionId ?? createSessionId());
  const [startedAt] = useState(() => matchingDraft?.startedAt ?? Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() => matchingDraft?.currentIndex ?? 0);
  const [sessionState, setSessionState] = useState<Record<string, ActiveWorkoutExerciseState>>(() =>
    exercises.reduce<Record<string, ActiveWorkoutExerciseState>>((acc, exercise) => {
      const latestRecord = [...records].reverse().find((record) => record.exerciseId === exercise.id || record.exerciseName === exercise.nome);
      acc[exercise.id] = matchingDraft?.exercises[exercise.id] ?? createInitialExerciseState(exercise, latestRecord?.sets);
      return acc;
    }, {}),
  );
  const [editingSet, setEditingSet] = useState<EditingSet | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState(matchingDraft?.photoUri ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const didHydrateDraft = useRef(false);
  const currentExercise = exercises[currentIndex];
  const currentState = currentExercise ? sessionState[currentExercise.id] : null;
  const completedExercises = exercises.filter((exercise) => sessionState[exercise.id]?.sets.every((set) => set.completed)).length;
  const workoutRecordsPayload = useMemo(
    () => createSessionRecords(exercises.map((exercise) => ({ exercise, state: sessionState[exercise.id] })).filter((item) => item.state)),
    [exercises, sessionState],
  );
  const totals = useMemo(() => calculateWorkoutTotals(workoutRecordsPayload), [workoutRecordsPayload]);
  const calories = Math.round((elapsedSeconds / 60) * 6);
  const hasCompletedSets = workoutRecordsPayload.length > 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (!workout) {
      return;
    }

    if (!didHydrateDraft.current) {
      didHydrateDraft.current = true;
      return;
    }

    saveActiveWorkoutDraft({
      sessionId,
      level: route.params.level,
      workoutSplit: route.params.workoutSplit,
      workoutIndex: route.params.workoutIndex,
      workoutTitle: workout.title,
      startedAt,
      elapsedSeconds,
      currentIndex,
      photoUri,
      updatedAt: new Date().toISOString(),
      exercises: sessionState,
    }).catch(() => {
      Alert.alert('Rascunho nao salvo', 'O treino continua aberto nesta tela. Tente finalizar antes de sair.');
    });
  }, [
    currentIndex,
    photoUri,
    route.params.level,
    route.params.workoutIndex,
    route.params.workoutSplit,
    saveActiveWorkoutDraft,
    sessionId,
    sessionState,
    startedAt,
    workout,
  ]);

  if (!workout || !currentExercise || !currentState) {
    return null;
  }

  const currentDone = currentState.sets.every((set) => set.completed);
  const allDone = exercises.every((exercise) => sessionState[exercise.id]?.sets.every((set) => set.completed));
  const nextPendingIndex = exercises.findIndex((exercise, index) => index !== currentIndex && !isExerciseComplete(exercise.id));
  const primaryActionLabel = allDone
    ? 'Finalizar treino'
    : currentDone
      ? 'Próximo pendente'
      : nextPendingIndex >= 0
        ? 'Pular por enquanto'
        : 'Completar exercício';
  const primaryActionIcon = allDone
    ? 'checkmark'
    : currentDone
      ? 'arrow-forward'
      : nextPendingIndex >= 0
        ? 'swap-horizontal'
        : 'alert-circle-outline';

  function isExerciseComplete(exerciseId: string) {
    return sessionState[exerciseId]?.sets.every((set) => set.completed) ?? false;
  }

  function selectExercise(index: number) {
    if (index === currentIndex) {
      return;
    }

    animateExerciseLayout();
    setCurrentIndex(index);
  }

  function updateExerciseState(exerciseId: string, updater: (state: ActiveWorkoutExerciseState) => ActiveWorkoutExerciseState) {
    setSessionState((current) => ({
      ...current,
      [exerciseId]: updater(current[exerciseId]),
    }));
  }

  function saveSet(exerciseId: string, setIndex: number, reps: number, kg: number, mode: ExerciseExecutionMode) {
    animateExerciseLayout();
    updateExerciseState(exerciseId, (state) => ({
      ...state,
      mode,
      sets: state.sets.map((set, index) =>
        index === setIndex
          ? {
              ...set,
              repeticoes: Math.max(1, Math.round(reps)),
              cargaKg: Math.max(0, kg),
              completed: true,
            }
          : set,
      ),
    }));
    setEditingSet(null);
  }

  function addSet() {
    animateExerciseLayout();
    updateExerciseState(currentExercise.id, (state) => ({
      ...state,
      sets: [
        ...state.sets,
        {
          setNumber: state.sets.length + 1,
          repeticoes: currentExercise.suggestedReps,
          cargaKg: currentExercise.defaultKg,
          completed: false,
        },
      ],
    }));
  }

  function markAllSets() {
    animateExerciseLayout();
    updateExerciseState(currentExercise.id, (state) => ({
      ...state,
      sets: state.sets.map((set) => ({ ...set, completed: true })),
    }));
  }

  function goNextExercise() {
    if (allDone) {
      setFinishOpen(true);
      return;
    }

    if (nextPendingIndex >= 0) {
      selectExercise(nextPendingIndex);
      return;
    }

    Alert.alert('Séries pendentes', 'Preencha reps e kg desse exercício para liberar o registro final do treino.');
  }

  async function pickWorkoutPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para adicionar uma foto do treino.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });

    if (result.canceled || !FileSystem.documentDirectory) {
      return;
    }

    const pickedUri = result.assets[0]?.uri;
    if (!pickedUri) {
      return;
    }

    const extension = pickedUri.split('.').pop()?.split('?')[0] || 'jpg';
    const localUri = `${FileSystem.documentDirectory}ironlog-workout-${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: pickedUri, to: localUri });
    setPhotoUri(localUri);
  }

  async function finishWorkout() {
    if (!hasCompletedSets) {
      Alert.alert('Treino sem series registradas', 'Registre ao menos uma serie para finalizar o treino.');
      return;
    }

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const completed = await completeWorkout(workoutRecordsPayload, {
        durationSeconds: elapsedSeconds,
        workoutTitle: workout.title,
        photoUri,
        sessionId,
      });

      if (completed) {
        if (isConfigured && platformProfile?.role === 'student') {
          try {
            const payload = mapWorkoutRecordsToSessionPayload({
              studentId: platformProfile.id,
              trainerId: route.params.assignmentMeta?.trainerId,
              routineId: route.params.assignmentMeta?.routineId,
              routineDayId: route.params.assignmentMeta?.routineDayId,
              clientSessionId: sessionId,
              workoutTitle: workout.title,
              durationSeconds: elapsedSeconds,
              records: workoutRecordsPayload.map((record, index) => ({
                ...record,
                id: `${sessionId}-${index}`,
                data: completed.completedAt,
                durationSeconds: elapsedSeconds,
                workoutTitle: workout.title,
              })),
            });
            await syncWorkoutSession(payload);
          } catch {
            Alert.alert('Treino salvo localmente', 'Nao foi possivel sincronizar agora. O registro local foi mantido.');
          }
        }
        navigation.replace('WorkoutComplete', { completedAt: completed.completedAt });
      }
    } catch {
      Alert.alert('Erro ao registrar treino', 'Nao feche a tela. Seu rascunho foi mantido para tentar novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  function requestCloseWorkout() {
    if (!hasCompletedSets) {
      clearActiveWorkoutDraft().finally(() => navigation.goBack());
      return;
    }

    Alert.alert('Sair do treino?', 'Seu progresso foi salvo como rascunho e podera ser retomado.', [
      { text: 'Continuar treinando', style: 'cancel' },
      { text: 'Sair', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#020406' }]}>
      <View style={styles.header}>
        <Pressable onPress={requestCloseWorkout} style={styles.iconButton}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</Text>
        <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.metrics}>
        <MetricDot value={formatDuration(elapsedSeconds)} label="Duração" active />
        <MetricDot value={`${Math.round(totals.totalVolumeKg)}`} label="Volume (kg)" />
        <MetricDot value={`${calories}`} label="Calorias estim." />
      </View>

      <View style={styles.exerciseCountRow}>
        <Text style={styles.sectionTitle}>
          {completedExercises}/{exercises.length} exercícios
        </Text>
        <Text style={styles.addText}>Adicionar exercício +</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.map((exercise, index) => {
          const expanded = index === currentIndex;
          const state = sessionState[exercise.id];
          const exerciseDone = state?.sets.every((set) => set.completed) ?? false;

          if (!state) {
            return null;
          }

          return (
            <View
              key={exercise.id}
              style={[
                styles.exerciseBlock,
                expanded
                  ? [styles.exerciseBlockActive, { backgroundColor: theme.colors.background, borderLeftColor: theme.colors.primary }]
                  : { backgroundColor: '#020406' },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: expanded }}
                onPress={() => selectExercise(index)}
                style={({ pressed }) => [styles.exerciseHeader, pressed ? styles.exerciseHeaderPressed : null]}
              >
                <View style={styles.exerciseArt}>
                  <MuscleDiagram label={normalizeMuscleName(exercise.grupoMuscular)} />
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseTitle}>{exercise.nome}</Text>
                  <Text style={styles.exerciseMeta}>
                    {state.sets.filter((set) => set.completed).length}/{state.sets.length} sets · {exercise.suggestedReps} reps
                  </Text>
                </View>
                {exerciseDone ? (
                  <View style={styles.exerciseDoneBadge}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                ) : expanded ? (
                  <Ionicons name="chevron-up" size={18} color="#FFFFFF" />
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#8D99A8" />
                )}
              </Pressable>

              {expanded ? (
                <View style={styles.expandedContent}>
                  <TextInput
                    value={state.note}
                    onChangeText={(note) => updateExerciseState(exercise.id, (current) => ({ ...current, note }))}
                    placeholder="Adicionar nota..."
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.noteInput, { color: theme.colors.text }]}
                  />

                  <View style={styles.setHeader}>
                    <Text style={styles.setHeaderText}>Set</Text>
                    <Text style={styles.setHeaderText}>Reps</Text>
                    <Text style={styles.setHeaderText}>Peso (kg)</Text>
                  </View>

                  {state.sets.map((set, setIndex) => (
                    <Pressable
                      key={set.setNumber}
                      onPress={() => setEditingSet({ exerciseId: exercise.id, setIndex })}
                      style={[styles.setRow, { backgroundColor: theme.colors.surface }]}
                    >
                      <Text style={styles.setText}>{set.setNumber}</Text>
                      <Text style={styles.setText}>{set.repeticoes}</Text>
                      <Text style={styles.setText}>{set.cargaKg.toFixed(2)}</Text>
                      <View style={[styles.setCheck, { backgroundColor: set.completed ? theme.colors.primary : theme.colors.surfaceElevated }]}>
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      </View>
                    </Pressable>
                  ))}

                  <View style={styles.setActions}>
                    <Pressable onPress={addSet} style={[styles.smallAction, { backgroundColor: theme.colors.surface }]}>
                      <Ionicons name="add" size={18} color={theme.colors.text} />
                    </Pressable>
                    <Pressable onPress={markAllSets} style={styles.markAllButton}>
                      <Text style={styles.markAllText}>Marcar todos os sets</Text>
                      <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {!allDone && hasCompletedSets ? (
          <Pressable onPress={() => setFinishOpen(true)} style={styles.partialFinishButton}>
            <Text style={styles.partialFinishText}>Finalizar parcial</Text>
          </Pressable>
        ) : null}
        <AppButton
          label={primaryActionLabel}
          icon={primaryActionIcon}
          onPress={goNextExercise}
          disabled={isSaving}
        />
      </View>

      <SetEditorModal
        visible={editingSet !== null}
        exercise={editingSet ? exercises.find((item) => item.id === editingSet.exerciseId) ?? currentExercise : currentExercise}
        state={editingSet ? sessionState[editingSet.exerciseId] : currentState}
        setIndex={editingSet?.setIndex ?? 0}
        onClose={() => setEditingSet(null)}
        onSave={saveSet}
      />

      <FinishWorkoutModal
        visible={finishOpen}
        photoUri={photoUri}
        duration={elapsedSeconds}
        exercisesCount={exercises.length}
        totalReps={totals.totalReps}
        totalVolume={totals.totalVolumeKg}
        calories={calories}
        isSaving={isSaving}
        onPickPhoto={pickWorkoutPhoto}
        onClose={() => setFinishOpen(false)}
        onFinish={finishWorkout}
      />
    </SafeAreaView>
  );
}

function MetricDot({ value, label, active = false }: { value: string; label: string; active?: boolean }) {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricLine}>
        {active ? <View style={styles.metricDot} /> : null}
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SetEditorModal({
  visible,
  exercise,
  state,
  setIndex,
  onClose,
  onSave,
}: {
  visible: boolean;
  exercise: WorkoutExercise;
  state: ActiveWorkoutExerciseState;
  setIndex: number;
  onClose: () => void;
  onSave: (exerciseId: string, setIndex: number, reps: number, kg: number, mode: ExerciseExecutionMode) => void;
}) {
  const { theme } = useTheme();
  const set = state.sets[setIndex] ?? state.sets[0];
  const [mode, setMode] = useState<ExerciseExecutionMode>(state.mode);
  const [reps, setReps] = useState(String(set?.repeticoes ?? exercise.suggestedReps));
  const [kg, setKg] = useState(String(set?.cargaKg ?? exercise.defaultKg));

  useEffect(() => {
    setMode(state.mode);
    setReps(String(set?.repeticoes ?? exercise.suggestedReps));
    setKg(String(set?.cargaKg ?? exercise.defaultKg));
  }, [exercise.defaultKg, exercise.suggestedReps, set?.cargaKg, set?.repeticoes, state.mode, visible]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.setModal, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {exercise.nome} ({setIndex + 1}/{state.sets.length})
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={[styles.modeSelector, { backgroundColor: theme.colors.input }]}>
            {(['bilateral', 'unilateral'] as ExerciseExecutionMode[]).map((item) => {
              const selected = mode === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  style={[styles.modeOption, selected ? { backgroundColor: theme.colors.primary } : null]}
                >
                  <Text style={[styles.modeText, { color: selected ? '#FFFFFF' : theme.colors.textMuted }]}>
                    {item === 'bilateral' ? 'Bilateral' : 'Unilateral'}
                  </Text>
                  <Ionicons name="barbell-outline" size={16} color={selected ? '#FFFFFF' : theme.colors.textMuted} />
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.modalHint, { color: theme.colors.textMuted }]}>
            Se escolher bilateral, o volume considera os dois lados do equipamento.
          </Text>

          <View style={styles.modalInputs}>
            <View style={[styles.modalInputBox, { backgroundColor: theme.colors.input }]}>
              <TextInput value={reps} onChangeText={setReps} keyboardType="number-pad" style={[styles.modalInput, { color: theme.colors.text }]} />
              <Text style={[styles.modalInputLabel, { color: theme.colors.textMuted }]}>Reps</Text>
            </View>
            <View style={[styles.modalInputBox, { backgroundColor: theme.colors.input }]}>
              <TextInput value={kg} onChangeText={setKg} keyboardType="decimal-pad" style={[styles.modalInput, { color: theme.colors.text }]} />
              <Text style={[styles.modalInputLabel, { color: theme.colors.textMuted }]}>Kg</Text>
            </View>
          </View>

          <AppButton
            label="Salvar"
            icon="checkmark"
            onPress={() => onSave(exercise.id, setIndex, parseNumber(reps), parseNumber(kg), mode)}
          />
        </View>
      </View>
    </Modal>
  );
}

function FinishWorkoutModal({
  visible,
  photoUri,
  duration,
  exercisesCount,
  totalReps,
  totalVolume,
  calories,
  isSaving,
  onPickPhoto,
  onClose,
  onFinish,
}: {
  visible: boolean;
  photoUri: string;
  duration: number;
  exercisesCount: number;
  totalReps: number;
  totalVolume: number;
  calories: number;
  isSaving: boolean;
  onPickPhoto: () => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.finishModal, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.finishTitle, { color: theme.colors.text }]}>Terminar e registrar seu treino?</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <Pressable onPress={onPickPhoto} style={[styles.photoDrop, { borderColor: theme.colors.textMuted }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.workoutPhoto} />
            ) : (
              <>
                <Ionicons name="image-outline" size={30} color={theme.colors.text} />
                <Text style={[styles.photoDropText, { color: theme.colors.textMuted }]}>
                  Adicione uma imagem e compartilhe seu progresso (opcional)
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.finishProgress}>
            <Text style={[styles.finishMetaText, { color: theme.colors.text }]}>{Math.max(1, Math.round(duration / 60))}min</Text>
            <Text style={[styles.finishMetaText, { color: theme.colors.text }]}>{exercisesCount} exercícios</Text>
          </View>
          <View style={[styles.finishTrack, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.finishTrackFill, { backgroundColor: theme.colors.primary, width: '100%' }]} />
          </View>

          <View style={styles.finishStats}>
            <FinishStat icon="fitness-outline" value={String(Math.round(totalVolume))} label="Peso total (kg)" />
            <FinishStat icon="repeat-outline" value={String(totalReps)} label="Repetições" />
            <FinishStat icon="flame-outline" value={String(calories)} label="Calorias" />
          </View>

          <AppButton label={isSaving ? 'Salvando...' : 'Registrar treino'} icon="checkmark" onPress={onFinish} disabled={isSaving} />
        </View>
      </View>
    </Modal>
  );
}

function FinishStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.finishStat}>
      <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
      <Text style={[styles.finishStatValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.finishStatLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    paddingVertical: 10,
  },
  metricItem: {
    alignItems: 'center',
    gap: 3,
  },
  metricLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D8CFF',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#8D99A8',
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseCountRow: {
    paddingHorizontal: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 104,
  },
  exerciseBlock: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  exerciseBlockActive: {
    borderLeftWidth: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  exerciseHeaderPressed: {
    opacity: 0.76,
  },
  exerciseDoneBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1D8CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseArt: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: '#8D99A8',
    fontSize: 13,
    fontWeight: '700',
  },
  expandedContent: {
    gap: 14,
    overflow: 'hidden',
    paddingTop: 2,
  },
  noteInput: {
    minHeight: 42,
    fontSize: 14,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  setHeaderText: {
    color: '#8D99A8',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  setRow: {
    minHeight: 46,
    borderRadius: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setText: {
    color: '#FFFFFF',
    minWidth: 50,
    fontSize: 14,
    fontWeight: '800',
  },
  setCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllButton: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    gap: 10,
  },
  partialFinishButton: {
    minHeight: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  partialFinishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  setModal: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modeSelector: {
    minHeight: 48,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 4,
  },
  modeOption: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInputBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 5,
  },
  modalInput: {
    minHeight: 48,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  finishModal: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 22,
    gap: 22,
  },
  finishTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  photoDrop: {
    minHeight: 166,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
    overflow: 'hidden',
  },
  workoutPhoto: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  photoDropText: {
    maxWidth: 240,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  finishProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finishMetaText: {
    fontSize: 14,
    fontWeight: '900',
  },
  finishTrack: {
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  finishTrackFill: {
    height: '100%',
  },
  finishStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  finishStat: {
    flex: 1,
    gap: 4,
  },
  finishStatValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  finishStatLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
