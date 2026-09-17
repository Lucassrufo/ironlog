import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { WorkoutExercise } from '../types/models';

export interface ExerciseEditState {
  series: string;
  repeticoes: string;
  cargaKg: string;
}

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  value: ExerciseEditState;
  onChange: (value: ExerciseEditState) => void;
  onPress?: () => void;
  checked?: boolean;
  onToggleChecked?: () => void;
}

export function ExerciseCard({ exercise, value, onChange, onPress, checked = false, onToggleChecked }: ExerciseCardProps) {
  const { theme } = useTheme();
  const iconName = exercise.icone as keyof typeof Ionicons.glyphMap;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Pressable style={styles.header} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Ionicons name={iconName} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.titleGroup}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{exercise.nome}</Text>
          <Text style={[styles.group, { color: theme.colors.textMuted }]}>{exercise.grupoMuscular}</Text>
        </View>
        <Ionicons name="play-circle-outline" size={24} color={theme.colors.primary} />
      </Pressable>

      <View style={styles.fields}>
        <EditableMetric
          label="kg"
          value={value.cargaKg}
          onChangeText={(cargaKg) => onChange({ ...value, cargaKg })}
        />
        <EditableMetric
          label="Séries"
          value={value.series}
          onChangeText={(series) => onChange({ ...value, series })}
        />
        <EditableMetric
          label="Reps"
          value={value.repeticoes}
          onChangeText={(repeticoes) => onChange({ ...value, repeticoes })}
        />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggleChecked}
        style={({ pressed }) => [
          styles.checkButton,
          {
            backgroundColor: checked ? theme.colors.primary : theme.colors.input,
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Ionicons name={checked ? 'checkmark-circle' : 'ellipse-outline'} size={21} color={checked ? '#FFFFFF' : theme.colors.primary} />
        <Text style={[styles.checkText, { color: checked ? '#FFFFFF' : theme.colors.text }]}>
          {checked ? 'Feito e conferido' : 'Conferir exercício feito'}
        </Text>
      </Pressable>
    </View>
  );
}

function EditableMetric({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        keyboardType="numeric"
        onChangeText={onChangeText}
        style={[
          styles.metricInput,
          {
            backgroundColor: theme.colors.input,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  group: {
    fontSize: 13,
    fontWeight: '600',
  },
  fields: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricInput: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  checkButton: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  checkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
