import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { WorkoutSplit } from '../../types/models';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { Screen } from '../../components/ui/Screen';
import { WorkoutSplitCard } from '../../components/training/WorkoutSplitCard';
import { levelContent } from '../../data/levels';
import { workoutSplitContent } from '../../data/workouts';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WorkoutSplitSelection'>;

const splitBlocks: Array<{ split: WorkoutSplit; eyebrow: string }> = [
  { split: 'normal', eyebrow: 'Bloco 1' },
  { split: 'fullBody', eyebrow: 'Bloco 2' },
];

export function WorkoutSplitSelectionScreen({ route }: Props) {
  const { finishOnboarding } = useUser();
  const selectedLevel = route.params.level;
  const [selectedWorkoutSplit, setSelectedWorkoutSplit] = useState<WorkoutSplit | null>(null);
  const levelTitle = useMemo(() => levelContent[selectedLevel]?.title ?? 'categoria escolhida', [selectedLevel]);

  return (
    <Screen>
      <OnboardingHeader
        step="Etapa 5 de 5"
        title="Escolha o tipo de treino:"
        subtitle={`Categoria selecionada: ${levelTitle}.`}
      />

      <View style={styles.blocks}>
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

      <View style={styles.footer}>
        <AppButton
          label="Entrar no IronLog"
          icon="checkmark"
          disabled={!selectedWorkoutSplit}
          onPress={() => {
            if (selectedWorkoutSplit) {
              finishOnboarding(selectedLevel, selectedWorkoutSplit);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  blocks: {
    gap: 12,
  },
  footer: {
    marginTop: 'auto',
  },
});
