import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { DashboardColumns, DashboardSpotlight, EmptyState } from '../../../components/web/DashboardWidgets';
import { WebDashboardLayout, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { LinkedStudent, linkStudentByEmail, listLinkedStudents } from '../../../services/platform/studentService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainerStudents'>;

export function TrainerStudentsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { platformProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadStudents() {
    if (!platformProfile) {
      return;
    }

    try {
      setStudents(await listLinkedStudents(platformProfile.id));
    } catch (error) {
      Alert.alert('Não foi possível carregar alunos', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  useEffect(() => {
    loadStudents();
  }, [platformProfile?.id]);

  async function handleLinkStudent() {
    if (!platformProfile || !email.trim()) {
      Alert.alert('Informe o email', 'Digite o email do aluno cadastrado.');
      return;
    }

    try {
      setSubmitting(true);
      await linkStudentByEmail(platformProfile.id, email);
      Alert.alert('Aluno vinculado', 'O aluno foi conectado ao seu perfil.');
      setEmail('');
      await loadStudents();
    } catch (error) {
      Alert.alert('Não foi possível vincular', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WebDashboardLayout
      eyebrow="Alunos"
      title="Alunos"
      subtitle="Conecte o aluno pelo email usado no cadastro. Depois você define a rotina e acompanha os treinos enviados pelo app."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Visão geral', icon: 'grid-outline', onPress: () => navigation.navigate('TrainerDashboard') },
        { label: 'Alunos', icon: 'people-outline', active: true, onPress: () => navigation.navigate('TrainerStudents') },
        { label: 'Rotinas', icon: 'barbell-outline', onPress: () => navigation.navigate('TrainerRoutines') },
      ]}
      actions={<AppButton label="Voltar" icon="chevron-back" variant="ghost" onPress={() => navigation.goBack()} />}
    >
      <DashboardColumns>
        <DashboardSpotlight
          icon="person-add-outline"
          label="Novo vínculo"
          title="Conecte pelo email do aluno"
          description="O aluno cria a própria conta. Você informa o email do cadastro e libera rotina, painel e chat no mesmo vínculo."
          meta={`${students.length} aluno${students.length === 1 ? '' : 's'}`}
        >
          <View style={styles.formCard}>
            <AppInput label="Email do aluno" value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
            <AppButton
              label={submitting ? 'Vinculando...' : 'Vincular aluno'}
              icon="person-add-outline"
              disabled={submitting}
              onPress={handleLinkStudent}
            />
          </View>
        </DashboardSpotlight>
      </DashboardColumns>

      <View style={styles.list}>
        {students.length === 0 ? (
          <WebPanel>
            <EmptyState
              icon="people-outline"
              title="Sua lista de alunos ainda está vazia"
              description="O primeiro aluno vinculado aparece aqui com atalho para rotina, histórico e chat."
            />
          </WebPanel>
        ) : (
          students.map((student) => (
            <Pressable
              key={student.id}
              onPress={() => navigation.navigate('TrainerStudentDetail', { studentId: student.id })}
              style={[styles.studentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.studentName, { color: theme.colors.text }]}>{student.name}</Text>
              <Text style={[styles.studentEmail, { color: theme.colors.textMuted }]}>{student.email}</Text>
            </Pressable>
          ))
        )}
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  formCard: {
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
  studentCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '900',
  },
  studentEmail: {
    fontSize: 13,
    fontWeight: '700',
  },
});

