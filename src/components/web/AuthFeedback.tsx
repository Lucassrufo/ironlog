import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FadeInView } from '../motion/FadeInView';
import { useTheme } from '../../context/ThemeContext';

type FeedbackTone = 'success' | 'error' | 'info';

const toneIcon: Record<FeedbackTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle-outline',
  error: 'alert-circle-outline',
  info: 'information-circle-outline',
};

export function AuthFeedback({ tone, title, message }: { tone: FeedbackTone; title: string; message: string }) {
  const { theme } = useTheme();
  const accent = tone === 'success' ? theme.colors.success : tone === 'error' ? theme.colors.danger : theme.colors.primary;

  return (
    <FadeInView distance={6} duration={260} style={[styles.box, { backgroundColor: theme.colors.surfaceElevated, borderColor: accent }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
        <Ionicons name={toneIcon[tone]} size={18} color={accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
  },
});
