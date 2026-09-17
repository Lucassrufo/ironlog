import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

interface LevelCardProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function LevelCard({ title, description, selected, onPress }: LevelCardProps) {
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
        <Ionicons name="barbell-outline" size={24} color={selected ? '#FFFFFF' : theme.colors.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
