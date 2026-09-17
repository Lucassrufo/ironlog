import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { WebDashboardLayout, WebMetricCard, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { assignRoutineToStudent, listTrainerRoutines } from '../../../services/platform/routineService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainerStudentDetail'>;

export function TrainerStudentDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { platformProfile } = useAuth();
  const [routines, setRoutines] = useState<Array<{ id: string; title: string; status: string }>>([]);

  useEffect(() => {
    if (!platformProfile) {
      return;
    }

    listTrainerRoutines(platformProfile.id)
      .then((rows) => setRoutines(rows as Array<{ id: string; title: string; status: string }>))
      .catch((error) => Alert.alert('Não foi possível carregar rotinas', error instanceof Error ? error.message : 'Tente novamente.'));
  }, [platformProfile?.id]);

  async function handleAssign(routineId: string) {
    if (!platformProfile) {
      return;
    }

    try {
      await assignRoutineToStudent({ trainerId: platformProfile.id, studentId: route.params.studentId, routineId });
      Alert.alert('Treino definido', 'A rotina foi atribuída ao aluno.');
    } catch (error) {
      Alert.alert('Não foi possível atribuir', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  return (
    <WebDashboardLayout
      eyebrow="Aluno"
      title="Aluno"
      subtitle="Veja o que esse aluno recebeu, o que treinou e onde o plano precisa mudar."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Visão geral', icon: 'grid-outline', onPress: () => navigation.navigate('TrainerDashboard') },
        { label: 'Alunos', icon: 'people-outline', active: true, onPress: () => navigation.navigate('TrainerStudents') },
        { label: 'Rotinas', icon: 'barbell-outline', onPress: () => navigation.navigate('TrainerRoutines') },
      ]}
      actions={<AppButton label="Voltar" icon="chevron-back" variant="ghost" onPress={() => navigation.goBack()} />}
    >
      <View style={styles.grid}>
        <WebMetricCard label="Aluno ID" value="ID" detail={route.params.studentId} />
        <WebMetricCard label="Frequência" value="0%" detail="Calculada pelos treinos enviados pelo app." />
        <WebMetricCard label="Volume recente" value="0 kg" detail="Sem sessões sincronizadas ainda." />
      </View>

      <WebPanel>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Definir treino</Text>
        {routines.length === 0 ? (
          <Text style={[styles.copy, { color: theme.colors.textMuted }]}>Crie uma rotina antes de atribuir.</Text>
        ) : (
          routines.map((routine) => (
            <Pressable
              key={routine.id}
              onPress={() => handleAssign(routine.id)}
              style={[styles.routineCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.routineTitle, { color: theme.colors.text }]}>{routine.title}</Text>
              <Text style={[styles.routineStatus, { color: theme.colors.textMuted }]}>Atribuir esta rotina</Text>
            </Pressable>
          ))
        )}
      </WebPanel>
      <View style={styles.actions}>
        <AppButton label="Abrir chat" icon="chatbubble-outline" onPress={() => navigation.navigate('PlatformChat', { studentId: route.params.studentId })} />
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  routineCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  routineStatus: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actions: {
    maxWidth: 280,
  },
});

