import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types/navigation';
import { formatDuration } from './DashboardScreen';
import { calculateWorkoutTotals } from '../utils/workoutMetrics';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { records } = useUser();
  const sessionRecords = records.filter((record) => record.data === route.params.completedAt);
  const workoutTitle = sessionRecords[0]?.workoutTitle ?? 'Treino';
  const duration = sessionRecords[0]?.durationSeconds ?? 0;
  const totals = calculateWorkoutTotals(sessionRecords);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Resumo do dia</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{workoutTitle}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {new Date(route.params.completedAt).toLocaleDateString('pt-BR')} · {formatDuration(duration)}
          </Text>
        </View>

        <View style={styles.metrics}>
          <Metric label="Exercícios" value={String(sessionRecords.length)} icon="barbell-outline" />
          <Metric label="Séries" value={String(totals.totalSets)} icon="list-outline" />
          <Metric label="Maior carga" value={`${totals.maxLoadKg} kg`} icon="speedometer-outline" />
        </View>
        <View style={styles.metrics}>
          <Metric label="Repetições" value={String(totals.totalReps)} icon="repeat-outline" />
          <Metric label="Tempo ativo" value={formatDuration(totals.workSeconds)} icon="timer-outline" />
          <Metric label="Volume" value={`${Math.round(totals.totalVolumeKg)} kg`} icon="trending-up-outline" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exercícios realizados</Text>
        <View style={styles.list}>
          {sessionRecords.map((record) => (
            <View key={record.id} style={[styles.exerciseRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.exerciseIcon}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{record.exerciseName}</Text>
                <Text style={[styles.exerciseMeta, { color: theme.colors.textMuted }]}>
                  {record.sets
                    ? record.sets.map((set) => `${set.setNumber}: ${set.repeticoes}x${set.cargaKg}kg`).join(' · ')
                    : `${record.series} séries · ${record.repeticoes} reps · ${record.cargaKg} kg`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
  },
  backText: {
    fontSize: 15,
    fontWeight: '800',
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  exerciseRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseIcon: {
    width: 34,
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '900',
  },
  exerciseMeta: {
    fontSize: 13,
    lineHeight: 19,
  },
});
