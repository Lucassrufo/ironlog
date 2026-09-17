import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

interface OnboardingHeaderProps {
  step: string;
  title: string;
  subtitle: string;
}

export function OnboardingHeader({ step, title, subtitle }: OnboardingHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.step, { color: theme.colors.primary }]}>{step}</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 12,
    gap: 8,
  },
  step: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
});
