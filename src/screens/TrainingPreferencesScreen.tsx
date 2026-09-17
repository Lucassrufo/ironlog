import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { ExperienceLevel, WorkoutSplit } from '../types/models';
import { LevelCard } from '../components/LevelCard';
import { RootStackParamList } from '../types/navigation';
import { WorkoutSplitCard } from '../components/WorkoutSplitCard';
import { levelContent, levelOrder } from '../data/levels';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { workoutSplitContent } from '../data/workouts';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainingPreferences'>;

const splitBlocks: Array<{ split: WorkoutSplit; eyebrow: string }> = [
  { split: 'normal', eyebrow: 'Bloco 1' },
  { split: 'fullBody', eyebrow: 'Bloco 2' },
];

export function TrainingPreferencesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, updateTrainingPreferences } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(user?.nivelAtual ?? 'iniciante');
  const [selectedWorkoutSplit, setSelectedWorkoutSplit] = useState<WorkoutSplit>(user?.workoutSplit ?? 'normal');

  if (!user) {
    return null;
  }

  const hasChanges = selectedLevel !== user.nivelAtual || selectedWorkoutSplit !== (user.workoutSplit ?? 'normal');

  function handleSave() {
    Alert.alert(
      'Alterar treino?',
      'Seu histórico continua salvo, mas a agenda e o progresso do nível serão atualizados para a nova escolha.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            await updateTrainingPreferences({
              nivelAtual: selectedLevel,
              workoutSplit: selectedWorkoutSplit,
            });
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>Treino</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Alterar categoria e rotina</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Escolha o nível e o formato de treino que devem aparecer na sua agenda.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categoria</Text>
        <View style={styles.list}>
          {levelOrder.map((level) => (
            <LevelCard
              key={level}
              title={levelContent[level].title}
              description={levelContent[level].description}
              selected={selectedLevel === level}
              onPress={() => setSelectedLevel(level)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tipo de treino</Text>
        <View style={styles.list}>
          {splitBlocks.map(({ split, eyebrow }) => (
            <WorkoutSplitCard
              key={split}
              eyebrow={eyebrow}
              title={workoutSplitContent[split].title}
              description={workoutSplitContent[split].description}
              selected={selectedWorkoutSplit === split}
              onPress={() => setSelectedWorkoutSplit(split)}
            />
          ))}
        </View>

        <AppButton label="Salvar treino" icon="save-outline" disabled={!hasChanges} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  list: {
    gap: 12,
  },
});
