import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { getMuscleHighlights } from '../utils/exercisePresentation';

interface MuscleDiagramProps {
  label: string;
  size?: 'small' | 'large';
}

export function MuscleDiagram({ label, size = 'small' }: MuscleDiagramProps) {
  const { theme } = useTheme();
  const highlights = getMuscleHighlights(label);
  const isLarge = size === 'large';
  const accent = theme.colors.primary;
  const mutedPart = theme.mode === 'dark' ? '#245167' : '#B7D8F6';
  const bodyColor = theme.mode === 'dark' ? '#17384B' : '#D9ECFF';
  const lineColor = theme.mode === 'dark' ? '#3B6D82' : '#8ABFEF';

  function active(part: string) {
    return highlights.includes(part) || highlights.includes('full');
  }

  return (
    <View
      style={[
        styles.tile,
        isLarge ? styles.tileLarge : styles.tileSmall,
        { backgroundColor: theme.colors.surfaceElevated },
      ]}
    >
      <View style={[styles.head, isLarge ? styles.headLarge : null, { backgroundColor: lineColor }]} />
      <View style={styles.upper}>
        <View style={[styles.shoulder, { backgroundColor: active('shoulders') || active('arms') ? accent : mutedPart }]} />
        <View style={[styles.torso, { backgroundColor: bodyColor }]}>
          <View style={styles.chestRow}>
            <View style={[styles.chest, { backgroundColor: active('chest') ? accent : mutedPart }]} />
            <View style={[styles.chest, { backgroundColor: active('chest') ? accent : mutedPart }]} />
          </View>
          <View style={[styles.core, { backgroundColor: active('core') ? accent : mutedPart }]} />
          <View style={[styles.core, { backgroundColor: active('core') ? accent : mutedPart }]} />
          <View style={[styles.backGlow, { backgroundColor: active('back') ? accent : 'transparent' }]} />
        </View>
        <View style={[styles.shoulder, { backgroundColor: active('shoulders') || active('arms') ? accent : mutedPart }]} />
      </View>
      <View style={styles.legs}>
        <View style={[styles.leg, { backgroundColor: active('legs') || active('glutes') ? accent : mutedPart }]} />
        <View style={[styles.leg, { backgroundColor: active('legs') || active('glutes') ? accent : mutedPart }]} />
      </View>
      {isLarge ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileSmall: {
    width: 64,
    height: 64,
  },
  tileLarge: {
    width: 96,
    height: 112,
    gap: 4,
  },
  head: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  headLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  upper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 3,
  },
  shoulder: {
    width: 8,
    height: 30,
    borderRadius: 6,
  },
  torso: {
    width: 34,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 5,
    gap: 3,
  },
  chestRow: {
    flexDirection: 'row',
    gap: 3,
  },
  chest: {
    width: 12,
    height: 9,
    borderRadius: 5,
  },
  core: {
    width: 20,
    height: 5,
    borderRadius: 4,
  },
  backGlow: {
    position: 'absolute',
    top: 8,
    width: 8,
    height: 26,
    borderRadius: 5,
  },
  legs: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
  },
  leg: {
    width: 10,
    height: 26,
    borderRadius: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
