import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';

interface AppButtonProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  onPress: () => void;
}

export function AppButton({ label, icon, variant = 'primary', disabled, onPress }: AppButtonProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const textColor = isPrimary || isDanger ? '#FFFFFF' : theme.colors.text;
  const iconColor = isPrimary || isDanger ? '#FFFFFF' : theme.colors.primary;

  function animateScale(toValue: number) {
    Animated.spring(scale, {
      toValue,
      speed: 24,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animateScale(0.985)}
        onPressOut={() => animateScale(1)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isDanger ? theme.colors.danger : isPrimary ? theme.colors.primary : 'transparent',
            borderColor: isDanger ? theme.colors.danger : isPrimary ? theme.colors.primary : theme.colors.border,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Platform.OS === 'web' ? 54 : 52,
    borderRadius: Platform.OS === 'web' ? 16 : 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
});
