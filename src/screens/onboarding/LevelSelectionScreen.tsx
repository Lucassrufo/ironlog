import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ExperienceLevel } from '../../types/models';
import { LevelCard } from '../../components/LevelCard';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { Screen } from '../../components/Screen';
import { levelContent, levelOrder } from '../../data/levels';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LevelSelection'>;

export function LevelSelectionScreen({ navigation }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);

  function confirmLevel(level: ExperienceLevel) {
    setSelectedLevel(level);
    Alert.alert(
      'Confirmar categoria',
      `Você quer começar como ${levelContent[level].title}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => navigation.navigate('WorkoutSplitSelection', { level }),
        },
      ],
    );
  }

  return (
    <Screen>
      <OnboardingHeader
        step="Etapa 4 de 5"
        title="Escolha seu ponto de partida:"
        subtitle="Selecione uma categoria para continuar."
      />

      <View style={styles.levels}>
        {levelOrder.map((level) => (
          <LevelCard
            key={level}
            title={levelContent[level].title}
            description={levelContent[level].description}
            selected={selectedLevel === level}
            onPress={() => confirmLevel(level)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  levels: {
    gap: 12,
  },
});
