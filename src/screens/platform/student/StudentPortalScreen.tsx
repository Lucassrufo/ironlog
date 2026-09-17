import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { ActivityList, AnimatedBarChart, DashboardColumns, DashboardGrid, DashboardSpotlight, EmptyState } from '../../../components/web/DashboardWidgets';
import { WebDashboardLayout, WebMetricCard, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { buildWeeklyWorkoutBars, summarizeStudentWorkoutPosts } from '../../../services/platform/dashboardInsights';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentPortal'>;

export function StudentPortalScreen({ navigation }: Props) {
  const { platformProfile, signOut } = useAuth();
  const { workoutPosts } = useUser();
  const { theme } = useTheme();
  const summary = useMemo(() => summarizeStudentWorkoutPosts(workoutPosts), [workoutPosts]);
  const volumeBars = useMemo(
    () => buildWeeklyWorkoutBars(workoutPosts.map((post) => ({ completedAt: post.data, value: post.totalVolumeKg })), new Date()),
    [workoutPosts],
  );
  const recentItems = workoutPosts.slice(0, 3).map((post) => ({
    title: post.workoutTitle,
    detail: `${new Date(post.data).toLocaleDateString('pt-BR')} · ${Math.round(post.totalVolumeKg)} kg · ${post.totalReps} reps`,
    icon: 'barbell-outline' as const,
  }));

  return (
    <WebDashboardLayout
      eyebrow="Painel do aluno"
      title={`Seu progresso, ${platformProfile?.name ?? 'aluno'}`}
      subtitle="Acompanhe o que foi registrado no app, veja o sinal da semana e chame o treinador quando precisar ajustar o plano."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Resultados', icon: 'analytics-outline', active: true, onPress: () => navigation.navigate('StudentPortal') },
        { label: 'Treino no app', icon: 'barbell-outline', onPress: () => navigation.navigate('Dashboard') },
        { label: 'Chat', icon: 'chatbubble-outline', onPress: () => navigation.navigate('PlatformChat') },
      ]}
      actions={<AppButton label="Sair" icon="log-out-outline" variant="ghost" onPress={signOut} />}
    >
      <DashboardGrid>
        <WebMetricCard label="Treinos concluídos" value={`${summary.totalWorkouts}`} detail={summary.lastWorkoutDate ? `Último: ${new Date(summary.lastWorkoutDate).toLocaleDateString('pt-BR')}` : 'Finalize o primeiro treino pelo app.'} />
        <WebMetricCard label="Volume registrado" value={`${summary.totalVolumeKg} kg`} detail="Soma do volume salvo nas sessões." />
        <WebMetricCard label="Repetições" value={`${summary.totalReps}`} detail="Trabalho registrado em exercícios por repetição." />
        <WebMetricCard label="Rotina ativa" value="-" detail="Aparece quando o treinador atribuir uma ficha." />
      </DashboardGrid>

      <DashboardColumns>
        <DashboardSpotlight
          icon="barbell-outline"
          label="Último sinal"
          title={summary.totalWorkouts ? summary.lastWorkoutTitle : 'O próximo registro começa no app'}
          description={
            summary.totalWorkouts
              ? 'Seu último treino já entrou no painel. Continue registrando séries, cargas e repetições para revelar tendência real.'
              : 'Finalize uma sessão no aplicativo. A web usa esse registro para montar gráficos, histórico e contexto para o treinador.'
          }
          meta={summary.totalWorkouts ? `${summary.totalWorkouts} sessões` : 'sem sessões'}
        >
          <View style={styles.actions}>
            <AppButton label="Abrir treino" icon="barbell-outline" onPress={() => navigation.navigate('Dashboard')} />
            <AppButton label="Falar com treinador" icon="chatbubble-outline" variant="ghost" onPress={() => navigation.navigate('PlatformChat')} />
          </View>
        </DashboardSpotlight>
        <AnimatedBarChart title="Volume da semana" data={volumeBars} valueSuffix=" kg" />
      </DashboardColumns>

      <DashboardColumns>
        <ActivityList title="Treinos recentes" items={recentItems} emptyText="Os treinos finalizados pelo app aparecem aqui com data, volume e repetições." />
        <WebPanel>
          <Text style={[styles.panelKicker, { color: theme.colors.primary }]}>rotina de uso</Text>
          <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Registre no app. Leia o progresso na web.</Text>
          <Text style={[styles.copy, { color: theme.colors.textMuted }]}>O celular fica para o treino. O portal fica para enxergar padrão, conversar com o treinador e entender o próximo ajuste.</Text>
          {summary.totalWorkouts === 0 ? (
            <EmptyState icon="phone-portrait-outline" title="Primeiro treino pendente" description="Abra o app, finalize uma sessão e volte para ver este painel sair do zero." />
          ) : null}
        </WebPanel>
      </DashboardColumns>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  panelKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
