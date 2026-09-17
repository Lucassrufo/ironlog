import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

type MainTabRoute = 'Dashboard' | 'TrainingHub' | 'Progress' | 'ExerciseLibrary' | 'Profile';

const tabs: Array<{ route: MainTabRoute; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { route: 'Dashboard', label: 'Meu Plano', icon: 'git-network-outline' },
  { route: 'TrainingHub', label: 'Treinos', icon: 'grid-outline' },
  { route: 'Progress', label: 'Progresso', icon: 'bar-chart-outline' },
  { route: 'ExerciseLibrary', label: 'Exercícios', icon: 'barbell-outline' },
  { route: 'Profile', label: 'Perfil', icon: 'person-outline' },
];

interface BottomTabBarProps {
  active: MainTabRoute;
}

export function BottomTabBar({ active }: BottomTabBarProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const selected = active === tab.route;

        return (
          <Pressable
            key={tab.route}
            accessibilityRole="button"
            onPress={() => navigation.navigate(tab.route)}
            style={({ pressed }) => [
              styles.item,
              selected ? { backgroundColor: theme.colors.primary } : null,
              { opacity: pressed ? 0.76 : 1 },
            ]}
          >
            <Ionicons name={tab.icon} size={22} color={selected ? '#FFFFFF' : theme.colors.textMuted} />
            <Text style={[styles.label, { color: selected ? '#FFFFFF' : theme.colors.textMuted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const bottomTabPadding = 114;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    minHeight: 66,
    borderRadius: 34,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 12,
  },
  item: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
