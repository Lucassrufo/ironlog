import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { WebDashboardLayout, WebPanel } from '../../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../../types/navigation';
import { createRoutineWithFirstExercise } from '../../../services/platform/routineService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainerRoutineEditor'>;

export function TrainerRoutineEditorScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { platformProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [dayTitle, setDayTitle] = useState('Treino A');
  const [focus, setFocus] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [loadKg, setLoadKg] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (!platformProfile || !title.trim() || !dayTitle.trim() || !exerciseName.trim()) {
      Alert.alert('Revise a rotina', 'Informe rotina, dia e pelo menos um exercício.');
      return;
    }

    try {
      setSubmitting(true);
      await createRoutineWithFirstExercise({
        trainerId: platformProfile.id,
        title: title.trim(),
        dayTitle: dayTitle.trim(),
        focus: focus.trim() || undefined,
        exerciseName: exerciseName.trim(),
        muscleGroup: muscleGroup.trim() || undefined,
        sets: Math.max(1, Number(sets) || 1),
        reps: Math.max(1, Number(reps) || 1),
        loadKg: Math.max(0, Number(loadKg.replace(',', '.')) || 0),
      });
      Alert.alert('Rotina criada', 'A rotina foi salva no Supabase.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WebDashboardLayout
      eyebrow="Construtor de treino"
      title="Editor de rotina"
      subtitle="Monte a primeira versão da ficha. Depois, atribua ao aluno certo em poucos cliques."
      userName={platformProfile?.name}
      navItems={[
        { label: 'Visão geral', icon: 'grid-outline', onPress: () => navigation.navigate('TrainerDashboard') },
        { label: 'Alunos', icon: 'people-outline', onPress: () => navigation.navigate('TrainerStudents') },
        { label: 'Rotinas', icon: 'barbell-outline', active: true, onPress: () => navigation.navigate('TrainerRoutines') },
      ]}
      actions={<AppButton label="Voltar" icon="chevron-back" variant="ghost" onPress={() => navigation.goBack()} />}
    >
      <WebPanel>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dados da rotina</Text>
        <View style={styles.formGrid}>
          <AppInput label="Nome da rotina" value={title} onChangeText={setTitle} />
          <AppInput label="Dia do treino" value={dayTitle} onChangeText={setDayTitle} />
          <AppInput label="Foco" value={focus} onChangeText={setFocus} />
          <AppInput label="Exercício" value={exerciseName} onChangeText={setExerciseName} />
          <AppInput label="Grupo muscular" value={muscleGroup} onChangeText={setMuscleGroup} />
          <AppInput label="Séries" value={sets} keyboardType="number-pad" onChangeText={setSets} />
          <AppInput label="Reps" value={reps} keyboardType="number-pad" onChangeText={setReps} />
          <AppInput label="Carga kg" value={loadKg} keyboardType="decimal-pad" onChangeText={setLoadKg} />
        </View>
        <AppButton label={submitting ? 'Salvando...' : 'Salvar rotina'} icon="save-outline" disabled={submitting} onPress={handleSave} />
      </WebPanel>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  formGrid: {
    gap: 14,
  },
});

