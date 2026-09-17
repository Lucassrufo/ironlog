import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

interface WorkoutSplitCardProps {
  eyebrow: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function WorkoutSplitCard({ eyebrow, title, description, selected, onPress }: WorkoutSplitCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primarySoft : theme.colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: selected ? '#EAF4FF' : theme.colors.primary }]}>{eyebrow}</Text>
        {selected ? <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" /> : null}
      </View>
      <Text style={[styles.title, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: selected ? '#EAF4FF' : theme.colors.textMuted }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    gap: 10,
  },
  header: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
