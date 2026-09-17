import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { RootStackParamList } from '../../types/navigation';
import { getExerciseEquipment, getExerciseInstructions, normalizeMuscleName } from '../../utils/exercisePresentation';
import { getWorkoutPlans } from '../../data/workouts';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;
type DetailTab = 'target' | 'instructions' | 'equipment';

const tabs: Array<{ key: DetailTab; label: string }> = [
  { key: 'target', label: 'Alvo' },
  { key: 'instructions', label: 'Instruções' },
  { key: 'equipment', label: 'Equipamento' },
];

const exerciseDemoAssets: Record<string, number> = {
  'supino inclinado com halteres': require('../../../assets/videos/supino_inclinado_halteres.gif'),
};

function normalizeExerciseName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getExerciseDemoAsset(name: string) {
  return exerciseDemoAssets[normalizeExerciseName(name)] ?? null;
}

export function ExerciseDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<DetailTab>('target');
  const workout = getWorkoutPlans(route.params.level, route.params.workoutSplit)?.[route.params.workoutIndex];
  const exercise = workout?.exercises.find((item) => item.id === route.params.exerciseId);
  const targetMuscle = normalizeMuscleName(exercise?.grupoMuscular ?? '');
  const instructions = useMemo(() => (exercise ? getExerciseInstructions(exercise) : []), [exercise]);
  const equipment = exercise ? getExerciseEquipment(exercise.nome) : '';
  const demoAsset = exercise ? getExerciseDemoAsset(exercise.nome) : null;

  if (!exercise) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#F6F7F4' }]}>
      <View style={styles.hero}>
        <View style={styles.heroActions}>
          <RoundButton icon="chevron-back" onPress={() => navigation.goBack()} />
          <RoundButton icon="star-outline" onPress={() => undefined} />
        </View>

        <View style={styles.exerciseArt}>
          {demoAsset ? (
            <Image key={exercise.id} source={demoAsset} style={styles.exerciseDemo} resizeMode="contain" />
          ) : (
            <>
              <View style={styles.machineLineVertical} />
              <View style={styles.machineLineDiagonal} />
              <View style={styles.plateLeft} />
              <View style={styles.plateRight} />
              <MuscleDiagram label={targetMuscle} size="large" />
            </>
          )}
        </View>
      </View>

      <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>{targetMuscle}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>Muito popular</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>{exercise.nome}</Text>

          <View style={[styles.segmented, { backgroundColor: theme.colors.surface }]}>
            {tabs.map((tab) => {
              const selected = activeTab === tab.key;

              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.segment, selected ? styles.segmentSelected : null]}
                >
                  <Text style={[styles.segmentText, { color: selected ? '#081018' : theme.colors.text }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === 'target' ? <TargetTab muscle={targetMuscle} description={exercise.descricao} /> : null}
          {activeTab === 'instructions' ? <InstructionsTab instructions={instructions} /> : null}
          {activeTab === 'equipment' ? <EquipmentTab equipment={equipment} /> : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function RoundButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.roundButton, { opacity: pressed ? 0.78 : 1 }]}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
    </Pressable>
  );
}

function TargetTab({ muscle, description }: { muscle: string; description: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.tabLabel, { color: theme.colors.text }]}>Primário</Text>
      <View style={styles.targetRow}>
        <MuscleDiagram label={muscle} />
        <View style={styles.targetCopy}>
          <Text style={[styles.targetTitle, { color: theme.colors.text }]}>{muscle}</Text>
          <Text style={[styles.targetDescription, { color: theme.colors.textMuted }]}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

function InstructionsTab({ instructions }: { instructions: string[] }) {
  const { theme } = useTheme();

  return (
    <View style={styles.tabContent}>
      {instructions.map((instruction, index) => (
        <View key={instruction} style={[styles.instructionRow, { borderColor: theme.colors.border }]}>
          <Text style={[styles.instructionNumber, { color: theme.colors.text }]}>{index + 1}</Text>
          <Text style={[styles.instructionText, { color: theme.colors.textMuted }]}>{instruction}</Text>
        </View>
      ))}
    </View>
  );
}

function EquipmentTab({ equipment }: { equipment: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.tabContent}>
      <View style={styles.targetRow}>
        <View style={[styles.equipmentArt, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="barbell-outline" size={34} color={theme.colors.primary} />
        </View>
        <View style={styles.targetCopy}>
          <Text style={[styles.targetTitle, { color: theme.colors.text }]}>{equipment}</Text>
          <Text style={[styles.targetDescription, { color: theme.colors.textMuted }]}>
            Ajuste a carga para manter controle em todas as repetições.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  hero: {
    minHeight: 360,
    backgroundColor: '#F6F7F4',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  exerciseDemo: {
    width: '100%',
    height: '100%',
  },
  machineLineVertical: {
    position: 'absolute',
    width: 7,
    height: 170,
    borderRadius: 4,
    backgroundColor: '#6E7477',
    transform: [{ rotate: '0deg' }],
  },
  machineLineDiagonal: {
    position: 'absolute',
    width: 7,
    height: 190,
    borderRadius: 4,
    backgroundColor: '#5F6669',
    transform: [{ rotate: '38deg' }],
  },
  plateLeft: {
    position: 'absolute',
    left: 94,
    top: 136,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#17191B',
  },
  plateRight: {
    position: 'absolute',
    right: 92,
    top: 176,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#17191B',
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  sheetContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 28,
    gap: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    minHeight: 24,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
  },
  segmented: {
    minHeight: 54,
    borderRadius: 27,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tabContent: {
    gap: 12,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  targetCopy: {
    flex: 1,
    gap: 5,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  targetDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  instructionRow: {
    minHeight: 66,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 14,
  },
  instructionNumber: {
    width: 16,
    fontSize: 16,
    fontWeight: '900',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  equipmentArt: {
    width: 70,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
