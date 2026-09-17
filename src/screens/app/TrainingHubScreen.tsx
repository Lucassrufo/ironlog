import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar, bottomTabPadding } from '../../components/navigation/BottomTabBar';
import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { RootStackParamList } from '../../types/navigation';
import { getTargetMuscles } from '../../utils/exercisePresentation';
import { levelContent } from '../../data/levels';
import { limitPlansForUser } from '../../utils/planPreferences';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getWorkoutPlans } from '../../data/workouts';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainingHub'>;

export function TrainingHubScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useUser();
  const plans = user ? limitPlansForUser(getWorkoutPlans(user.nivelAtual, user.workoutSplit ?? 'normal'), user) : [];
  const featuredPlans = plans.slice(0, 4);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Treinos</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Favoritos em breve', 'A biblioteca ja esta pronta para receber favoritos, mas essa acao ainda sera finalizada.')}
            style={[styles.starButton, { backgroundColor: theme.colors.surface }]}
          >
            <Ionicons name="star-outline" size={23} color={theme.colors.text} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recursos personalizados</Text>
        <View style={styles.resourceGrid}>
          <ResourceCard
            icon="flash-outline"
            title="Criar treino rapido"
            onPress={() => Alert.alert('Treino rapido em breve', 'Por enquanto, use um dos planos prontos ou finalize um treino parcial.')}
          />
          <ResourceCard icon="calendar-outline" title="Agenda e historico" onPress={() => navigation.navigate('WorkoutSchedule')} />
        </View>

        <SectionHeader title={`Treinos rápidos para ${levelContent[user.nivelAtual].title.toLowerCase()}`} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
          {featuredPlans.map((plan, index) => (
            <WorkoutFeatureCard
              key={plan.id}
              title={plan.title}
              subtitle={`${plan.exercises.length} exercícios · ${plan.focus}`}
              muscle={getTargetMuscles(plan.exercises, 1)[0] ?? plan.focus}
              darken={index % 2 === 1}
              onPress={() => navigation.navigate('Dashboard', { initialWorkoutIndex: index })}
            />
          ))}
        </ScrollView>

        <SectionHeader title={`Planos de treino para ${levelContent[user.nivelAtual].title.toLowerCase()}`} />
        <View style={styles.planList}>
          {plans.map((plan, index) => (
            <Pressable
              key={plan.id}
              onPress={() => navigation.navigate('Dashboard', { initialWorkoutIndex: index })}
              style={({ pressed }) => [
                styles.planRow,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <MuscleDiagram label={getTargetMuscles(plan.exercises, 1)[0] ?? plan.focus} />
              <View style={styles.planCopy}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>
                  Dia {index + 1}: {plan.title}
                </Text>
                <Text style={[styles.planMeta, { color: theme.colors.textMuted }]}>
                  {plan.exercises.length} exercícios · {plan.focus}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomTabBar active="TrainingHub" />
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.seeAll, { color: theme.colors.textMuted }]}>Ver todos</Text>
    </View>
  );
}

function ResourceCard({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress?: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.resourceCard,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={[styles.resourceIcon, { backgroundColor: theme.colors.input }]}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
      </View>
      <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>{title}</Text>
    </Pressable>
  );
}

function WorkoutFeatureCard({
  title,
  subtitle,
  muscle,
  darken,
  onPress,
}: {
  title: string;
  subtitle: string;
  muscle: string;
  darken: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        { backgroundColor: darken ? theme.colors.surface : theme.colors.surfaceElevated, opacity: pressed ? 0.84 : 1 },
      ]}
    >
      <View style={styles.featureTop}>
        <MuscleDiagram label={muscle} size="large" />
        <View style={[styles.favoriteBadge, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <Ionicons name="star-outline" size={19} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.featureCopy}>
        <Text style={[styles.featureLevel, { color: theme.colors.textMuted }]}>IronLog</Text>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.featureMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {subtitle}
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
    padding: 16,
    paddingBottom: bottomTabPadding,
    gap: 22,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
  },
  starButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '800',
  },
  resourceGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  resourceCard: {
    flex: 1,
    minHeight: 128,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  featuredRow: {
    gap: 14,
    paddingRight: 16,
  },
  featureCard: {
    width: 200,
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
  },
  featureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  favoriteBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    gap: 3,
  },
  featureLevel: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  featureMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  planList: {
    gap: 10,
  },
  planRow: {
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  planMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
});
