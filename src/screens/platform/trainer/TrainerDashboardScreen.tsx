import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/AppButton';
import { ActivityList, AnimatedBarChart, DashboardColumns, DashboardGrid, DashboardSpotlight, EmptyState } from '../../../components/web/DashboardWidgets';
import { WebDashboardLayout, WebMetricCard, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { buildWeeklyWorkoutBars } from '../../../services/platform/dashboardInsights';
import { listTrainerRoutines } from '../../../services/platform/routineService';
import { listLinkedStudents } from '../../../services/platform/studentService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainerDashboard'>;

export function TrainerDashboardScreen({ navigation }: Props) {
  const { platformProfile, signOut } = useAuth();
  const { theme } = useTheme();
  const [studentCount, setStudentCount] = useState(0);
  const [routineCount, setRoutineCount] = useState(0);

  useEffect(() => {
    if (!platformProfile?.id) {
      return;
    }

    Promise.all([listLinkedStudents(platformProfile.id), listTrainerRoutines(platformProfile.id)])
      .then(([students, routines]) => {
        setStudentCount(students.filter((student) => student.status === 'active').length);
        setRoutineCount(routines.length);
      })
      .catch((error) => {
        Alert.alert('Não foi possível carregar o painel', error instanceof Error ? error.message : 'Tente novamente.');
      });
  }, [platformProfile?.id]);

  const weeklyBars = useMemo(() => buildWeeklyWorkoutBars([], new Date()), []);

  return (
    <WebDashboardLayout
      eyebrow="Painel do treinador"
      title={`Bom treino, ${platformProfile?.name ?? 'treinador'}`}
      subtitle="Abra a operação do dia, veja onde falta ação e ajuste a rotina do aluno antes da próxima sessão."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Visão geral', icon: 'grid-outline', active: true, onPress: () => navigation.navigate('TrainerDashboard') },
        { label: 'Alunos', icon: 'people-outline', onPress: () => navigation.navigate('TrainerStudents') },
        { label: 'Rotinas', icon: 'barbell-outline', onPress: () => navigation.navigate('TrainerRoutines') },
      ]}
      actions={<AppButton label="Sair" icon="log-out-outline" variant="ghost" onPress={signOut} />}
    >
      <DashboardGrid>
        <WebMetricCard label="Alunos ativos" value={`${studentCount}`} detail={studentCount ? 'Vínculos prontos para acompanhamento.' : 'Convide o primeiro aluno pelo email.'} />
        <WebMetricCard label="Treinos recebidos" value="0" detail="Este número sobe quando alunos sincronizam pelo app." />
        <WebMetricCard label="Rotinas salvas" value={`${routineCount}`} detail={routineCount ? 'Fichas prontas para atribuir.' : 'Crie a primeira ficha base.'} />
        <WebMetricCard label="Conversas" value="0" detail="Mensagens ficam presas ao vínculo treinador-aluno." />
      </DashboardGrid>

      <DashboardColumns>
        <DashboardSpotlight
          icon="people-outline"
          label="Próxima ação"
          title={studentCount ? `${studentCount} aluno${studentCount > 1 ? 's' : ''} na sua fila` : 'Sua fila ainda está limpa'}
          description={
            studentCount
              ? 'Entre no aluno certo, veja o histórico e ajuste o plano com base no que ele realmente registrou.'
              : 'Conecte um aluno cadastrado. Depois disso, rotina, chat e progresso aparecem no mesmo lugar.'
          }
          meta={routineCount ? `${routineCount} rotinas` : 'sem rotina'}
        >
          <View style={styles.actions}>
            <AppButton label="Abrir alunos" icon="people-outline" onPress={() => navigation.navigate('TrainerStudents')} />
            <AppButton label="Nova rotina" icon="add" variant="ghost" onPress={() => navigation.navigate('TrainerRoutineEditor')} />
          </View>
        </DashboardSpotlight>

        <AnimatedBarChart title="Treinos recebidos" data={weeklyBars} />
      </DashboardColumns>

      <WebPanel>
        <Text style={[styles.panelKicker, { color: theme.colors.primary }]}>comece pelo essencial</Text>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Monte uma ficha curta e atribua ao aluno certo.</Text>
        <Text style={[styles.panelText, { color: theme.colors.textMuted }]}>O IronLog fica melhor quando cada aluno tem um plano claro, um treinador responsável e um histórico que mostra a próxima decisão.</Text>
        <View style={styles.actions}>
          <AppButton label="Gerenciar alunos" icon="people-outline" onPress={() => navigation.navigate('TrainerStudents')} />
          <AppButton label="Criar rotina" icon="add" variant="ghost" onPress={() => navigation.navigate('TrainerRoutineEditor')} />
        </View>
      </WebPanel>

      <DashboardColumns>
        <ActivityList
          title="Sinais da semana"
          emptyText="Quando um aluno ficar sem treino recente, sem rotina atribuída ou com mensagem pendente, ele entra nesta fila."
          items={[]}
        />
        <WebPanel>
          <EmptyState
            icon="shield-checkmark-outline"
            title="Permissões separadas por papel"
            description="Treinador não vê dados de quem não está vinculado. Aluno só acessa o próprio progresso, rotina atribuída e chat."
          />
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
  panelText: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
