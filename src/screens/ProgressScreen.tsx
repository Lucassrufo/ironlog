import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar, bottomTabPadding } from '../components/BottomTabBar';
import { MuscleDiagram } from '../components/MuscleDiagram';
import { RootStackParamList } from '../types/navigation';
import { addPeriodAnchor, filterRecordsByRange, getLocalDateKey, getPeriodRange, listDaysInRange, ProgressPeriod } from '../utils/datePeriods';
import { normalizeMuscleName } from '../utils/exercisePresentation';
import { calculateWorkoutTotals } from '../utils/workoutMetrics';
import { getWorkoutPlans } from '../data/workouts';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

const weekdays = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sab.'];
const periodTabs: Array<[ProgressPeriod, string]> = [
  ['last', 'Ultimo'],
  ['week', 'Semana'],
  ['month', 'Mes'],
  ['year', 'Anual'],
];

function formatShortDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function ProgressScreen(_: Props) {
  const { theme } = useTheme();
  const { user, records } = useUser();
  const [period, setPeriod] = useState<ProgressPeriod>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const range = useMemo(() => getPeriodRange(period, anchorDate), [anchorDate, period]);
  const scopedRecords = useMemo(() => filterRecordsByRange(records, range), [records, range]);
  const totals = calculateWorkoutTotals(scopedRecords);
  const exerciseGroupById = new Map<string, string>();

  if (user) {
    getWorkoutPlans(user.nivelAtual, user.workoutSplit ?? 'normal').forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        exerciseGroupById.set(exercise.id, exercise.grupoMuscular);
      });
    });
  }

  const sessions = new Map<string, { durationSeconds: number }>();
  const totalSeconds = scopedRecords.reduce((sum, record) => {
    if (sessions.has(record.data)) {
      return sum;
    }

    sessions.set(record.data, { durationSeconds: record.durationSeconds });
    return sum + record.durationSeconds;
  }, 0);
  const calories = Math.round((totalSeconds / 60) * 6);
  const periodDays = period === 'year' ? [] : listDaysInRange(range);
  const chartMonths = period === 'year' ? Array.from({ length: 12 }, (_, index) => new Date(anchorDate.getFullYear(), index, 1)) : [];
  const chartDates = period === 'year' ? chartMonths : periodDays;
  const sessionsByDay = new Map<string, number>();
  const sessionsByMonth = new Map<number, number>();

  Array.from(sessions.keys()).forEach((sessionDate) => {
    const date = new Date(sessionDate);
    const dayKey = getLocalDateKey(date);
    sessionsByDay.set(dayKey, (sessionsByDay.get(dayKey) ?? 0) + 1);
    sessionsByMonth.set(date.getMonth(), (sessionsByMonth.get(date.getMonth()) ?? 0) + 1);
  });

  const maxDay = Math.max(
    1,
    ...chartDates.map((date) => (period === 'year' ? sessionsByMonth.get(date.getMonth()) ?? 0 : sessionsByDay.get(getLocalDateKey(date)) ?? 0)),
  );
  const trainedRegions = Array.from(
    scopedRecords.reduce((map, record) => {
      const muscle = normalizeMuscleName(exerciseGroupById.get(record.exerciseId) ?? record.exerciseName);
      map.set(muscle, (map.get(muscle) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.periodTabs, { backgroundColor: theme.colors.surface }]}>
          {periodTabs.map(([value, label]) => {
            const selected = period === value;

            return (
              <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.periodTab, selected ? styles.periodTabSelected : null]}>
                <Text style={[styles.periodText, { color: selected ? '#081018' : theme.colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.weekHeader}>
          <Pressable onPress={() => setAnchorDate((current) => addPeriodAnchor(current, period, -1))}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.weekTitle, { color: theme.colors.text }]}>
            {formatShortDate(range.start)} - {formatShortDate(range.end)}
          </Text>
          <Pressable onPress={() => setAnchorDate((current) => addPeriodAnchor(current, period, 1))}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.dayStrip}>
          {chartDates.slice(0, period === 'month' ? 14 : undefined).map((date) => (
            <View key={date.toISOString()} style={styles.dayItem}>
              <Text style={[styles.dayName, { color: theme.colors.textMuted }]}>
                {period === 'year' ? date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : weekdays[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, { color: theme.colors.text }]}>{period === 'year' ? date.getMonth() + 1 : date.getDate()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metricGrid}>
          <Metric icon="grid-outline" value={String(sessions.size)} label="Treinos" />
          <Metric icon="git-network-outline" value={String(scopedRecords.length)} label="Exercicios" />
          <Metric icon="time-outline" value={String(Math.round(totalSeconds / 60))} label="Min" />
          <Metric icon="flame-outline" value={String(calories)} label="Calorias" />
          <Metric icon="barbell-outline" value={String(totals.totalReps)} label="Repeticoes" />
          <Metric icon="fitness-outline" value={`${Math.round(totals.totalVolumeKg)}kg`} label="Volume" />
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartLabel, { color: theme.colors.text }]}>Treinos</Text>
              <Text style={[styles.chartValue, { color: theme.colors.primarySoft }]}>{sessions.size}</Text>
            </View>
            <View>
              <Text style={[styles.chartLabel, { color: theme.colors.text }]}>Min</Text>
              <Text style={[styles.chartValue, { color: theme.colors.primarySoft }]}>{Math.round(totalSeconds / 60)}</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {chartDates.map((date) => {
              const count = period === 'year' ? sessionsByMonth.get(date.getMonth()) ?? 0 : sessionsByDay.get(getLocalDateKey(date)) ?? 0;
              const height = 18 + (count / maxDay) * 96;

              return (
                <View key={date.toISOString()} style={styles.barSlot}>
                  <View style={[styles.chartBar, { height, backgroundColor: count > 0 ? theme.colors.primary : theme.colors.surfaceElevated }]} />
                  <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>
                    {period === 'year' ? date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.regionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.regionTitle, { color: theme.colors.text }]}>Regioes mais treinadas</Text>
          <View style={styles.regionRow}>
            {(trainedRegions.length ? trainedRegions : ([
              ['Peito', 0],
              ['Costas', 0],
              ['Pernas', 0],
            ] as Array<[string, number]>)).map(([region, count]) => (
              <View key={region} style={styles.regionItem}>
                <MuscleDiagram label={region} size="large" />
                <Text style={[styles.regionName, { color: theme.colors.text }]}>{region}</Text>
                <Text style={[styles.regionCount, { color: theme.colors.textMuted }]}>{count} registros</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomTabBar active="Progress" />
    </SafeAreaView>
  );
}

function Metric({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name={icon} size={21} color={theme.colors.textMuted} />
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 6,
    paddingBottom: bottomTabPadding,
    gap: 10,
  },
  periodTabs: {
    minHeight: 44,
    borderRadius: 22,
    flexDirection: 'row',
    padding: 4,
  },
  periodTab: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabSelected: { backgroundColor: '#FFFFFF' },
  periodText: {
    fontSize: 10,
    fontWeight: '900',
  },
  weekHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  weekTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  dayStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  dayItem: {
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: '900',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  metricCard: {
    width: '49%',
    minHeight: 74,
    borderRadius: 8,
    padding: 12,
    gap: 2,
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  chartCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    gap: 42,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  chartValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  chart: {
    minHeight: 152,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBar: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  regionCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  regionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  regionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  regionName: {
    fontSize: 12,
    fontWeight: '900',
  },
  regionCount: {
    fontSize: 10,
    fontWeight: '800',
  },
});
