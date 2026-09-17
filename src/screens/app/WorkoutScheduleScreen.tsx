import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types/navigation';
import { formatDuration } from './DashboardScreen';
import { getWorkoutPlans, workoutSplitContent } from '../../data/workouts';
import { levelContent } from '../../data/levels';
import { limitPlansForUser } from '../../utils/planPreferences';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSchedule'>;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function WorkoutScheduleScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, records } = useUser();

  if (!user) {
    return null;
  }

  const completedSessions = Array.from(
    records.reduce((map, record) => {
      if (!map.has(record.data)) {
        map.set(record.data, {
          data: record.data,
          title: record.workoutTitle,
          durationSeconds: record.durationSeconds,
          exercises: 0,
        });
      }

      const current = map.get(record.data);
      if (current) {
        current.exercises += 1;
      }

      return map;
    }, new Map<string, { data: string; title: string; durationSeconds: number; exercises: number }>()),
  )
    .map(([, session]) => session)
    .sort((a, b) => b.data.localeCompare(a.data));

  const preferredPlans = limitPlansForUser(getWorkoutPlans(user.nivelAtual, user.workoutSplit ?? 'normal'), user);
  const upcoming = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(new Date(), index);
    const workout = preferredPlans.find((plan) => plan.weekDay === date.getDay());
    return workout ? { date, workout } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{levelContent[user.nivelAtual].title}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Agenda de treinos</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {completedSessions.length} treinos concluídos · {workoutSplitContent[user.workoutSplit ?? 'normal'].title}.
          </Text>
        </View>

        <View style={[styles.summaryPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Treinos feitos</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{completedSessions.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Nível</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{levelContent[user.nivelAtual].title}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Rotina</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {user.workoutSplit === 'fullBody' ? 'ABC' : 'Normal'}
            </Text>
          </View>
        </View>

        <SectionTitle title="Próximos treinos" />
        <View style={styles.list}>
          {upcoming.map(({ date, workout }) => (
            <View key={`${date.toISOString()}-${workout.id}`} style={[styles.rowCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.dateBox, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Text style={[styles.dateDay, { color: theme.colors.text }]}>{String(date.getDate()).padStart(2, '0')}</Text>
                <Text style={[styles.dateMonth, { color: theme.colors.textMuted }]}>
                  {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{workout.title}</Text>
                <Text style={[styles.rowMeta, { color: theme.colors.textMuted }]}>
                  {date.toLocaleDateString('pt-BR', { weekday: 'long' })} · {workout.exercises.length} exercícios
                </Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Treinos feitos" />
        <View style={styles.list}>
          {completedSessions.length === 0 ? (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum treino concluído ainda.</Text>
          ) : (
            completedSessions.map((session) => (
              <Pressable
                key={session.data}
                onPress={() => navigation.navigate('WorkoutSummary', { completedAt: session.data })}
                style={[styles.rowCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <View style={[styles.doneIcon, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{session.title}</Text>
                  <Text style={[styles.rowMeta, { color: theme.colors.textMuted }]}>
                    {new Date(session.data).toLocaleDateString('pt-BR')} · {formatDuration(session.durationSeconds)} · {session.exercises} exercícios
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>;
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
  summaryPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryItem: {
    flex: 1,
    minWidth: 90,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  rowCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '900',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  doneIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  rowMeta: {
    fontSize: 13,
    lineHeight: 19,
    textTransform: 'capitalize',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
