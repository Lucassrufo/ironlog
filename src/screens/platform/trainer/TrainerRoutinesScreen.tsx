import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { DashboardColumns, DashboardSpotlight, EmptyState } from '../../../components/web/DashboardWidgets';
import { WebDashboardLayout, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { listTrainerRoutines } from '../../../services/platform/routineService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainerRoutines'>;

export function TrainerRoutinesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { platformProfile } = useAuth();
  const [routines, setRoutines] = useState<Array<{ id: string; title: string; status: string }>>([]);

  async function loadRoutines() {
    if (!platformProfile) {
      return;
    }

    try {
      setRoutines((await listTrainerRoutines(platformProfile.id)) as Array<{ id: string; title: string; status: string }>);
    } catch (error) {
      Alert.alert('Não foi possível carregar rotinas', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  useEffect(() => {
    loadRoutines();
  }, [platformProfile?.id]);

  return (
    <WebDashboardLayout
      eyebrow="Rotinas"
      title="Rotinas"
      subtitle="Monte uma ficha base e atribua para o aluno certo, sem copiar treino por mensagem."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Visão geral', icon: 'grid-outline', onPress: () => navigation.navigate('TrainerDashboard') },
        { label: 'Alunos', icon: 'people-outline', onPress: () => navigation.navigate('TrainerStudents') },
        { label: 'Rotinas', icon: 'barbell-outline', active: true, onPress: () => navigation.navigate('TrainerRoutines') },
      ]}
      actions={<AppButton label="Nova rotina" icon="add" onPress={() => navigation.navigate('TrainerRoutineEditor')} />}
    >
      <DashboardColumns>
        <DashboardSpotlight
          icon="barbell-outline"
          label="Biblioteca"
          title={routines.length ? `${routines.length} rotina${routines.length > 1 ? 's' : ''} criada${routines.length > 1 ? 's' : ''}` : 'Monte a primeira rotina'}
          description="Crie fichas reutilizáveis, atribua para alunos e ajuste quando o treino real pedir mudança."
          meta="treino estruturado"
        >
          <AppButton label="Criar rotina" icon="add" onPress={() => navigation.navigate('TrainerRoutineEditor')} />
        </DashboardSpotlight>
      </DashboardColumns>

      <View style={styles.list}>
        {routines.length === 0 ? (
          <WebPanel>
            <EmptyState
              icon="document-text-outline"
              title="Nenhuma rotina criada ainda"
              description="Crie a primeira ficha para liberar a atribuição no perfil do aluno."
            />
          </WebPanel>
        ) : (
          routines.map((routine) => (
            <Pressable
              key={routine.id}
              onPress={() => navigation.navigate('TrainerRoutineEditor', { routineId: routine.id })}
              style={[styles.routineCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.routineTitle, { color: theme.colors.text }]}>{routine.title}</Text>
              <Text style={[styles.routineStatus, { color: theme.colors.textMuted }]}>{routine.status}</Text>
            </Pressable>
          ))
        )}
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  routineCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 6,
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
});

