import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { FadeInView } from '../motion/FadeInView';
import { useTheme } from '../../context/ThemeContext';

export type AnimatedBarDatum = {
  key: string;
  label: string;
  value: number;
  progress: number;
};

export function DashboardGrid({ children }: PropsWithChildren) {
  return <View style={styles.grid}>{children}</View>;
}

export function DashboardColumns({ children }: PropsWithChildren) {
  return <View style={styles.columns}>{children}</View>;
}

export function DashboardSpotlight({
  label,
  title,
  description,
  meta,
  icon,
  children,
}: PropsWithChildren<{
  label: string;
  title: string;
  description: string;
  meta?: string;
  icon: keyof typeof Ionicons.glyphMap;
}>) {
  const { theme } = useTheme();

  return (
    <FadeInView style={[styles.spotlight, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <View style={[styles.spotlightGlow, { backgroundColor: theme.colors.primary }]} />
      <View style={styles.spotlightTop}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(22,132,255,0.13)', borderColor: theme.colors.border }]}> 
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        {meta ? <Text style={[styles.metaPill, { color: theme.colors.textMuted, borderColor: theme.colors.border }]}>{meta}</Text> : null}
      </View>
      <Text style={[styles.kicker, { color: theme.colors.primary }]}>{label}</Text>
      <Text style={[styles.spotlightTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.spotlightDescription, { color: theme.colors.textMuted }]}>{description}</Text>
      {children ? <View style={styles.spotlightChildren}>{children}</View> : null}
    </FadeInView>
  );
}

export function AnimatedBarChart({ title, data, valueSuffix = '' }: { title: string; data: AnimatedBarDatum[]; valueSuffix?: string }) {
  const { theme } = useTheme();
  const bars = useRef(data.map(() => new Animated.Value(0))).current;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const best = data.reduce<AnimatedBarDatum | null>((winner, item) => (!winner || item.value > winner.value ? item : winner), null);

  useEffect(() => {
    Animated.stagger(
      85,
      bars.map((bar, index) =>
        Animated.spring(bar, {
          toValue: Math.max(0.05, data[index]?.progress ?? 0),
          speed: 12,
          bounciness: 7,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [bars, data]);

  return (
    <FadeInView delay={110} style={[styles.chart, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <View style={styles.chartHeader}>
        <View>
          <Text style={[styles.chartKicker, { color: theme.colors.primary }]}>sinal de carga</Text>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>
        <View style={[styles.chartBadge, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
          <Text style={[styles.chartBadgeValue, { color: theme.colors.text }]}>{Math.round(total)}</Text>
          <Text style={[styles.chartBadgeLabel, { color: theme.colors.textMuted }]}>{valueSuffix.trim() || 'pts'}</Text>
        </View>
      </View>
      <View style={styles.barRow}>
        {data.map((item, index) => {
          const active = item.value > 0;
          return (
            <View key={item.key} style={styles.barItem}>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}> 
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.border,
                      opacity: active ? 1 : 0.55,
                      height: bars[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['5%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: active ? theme.colors.text : theme.colors.textMuted }]}>{item.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.chartInsight, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
        <Ionicons name="trending-up-outline" size={17} color={theme.colors.primary} />
        <Text style={[styles.chartInsightText, { color: theme.colors.textMuted }]}> 
          {best && best.value > 0 ? `Maior movimento em ${best.label}: ${Math.round(best.value)}${valueSuffix}.` : 'Assim que houver registro, este gráfico mostra o ritmo da semana.'}
        </Text>
      </View>
    </FadeInView>
  );
}

export function ActivityList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Array<{ title: string; detail: string; icon: keyof typeof Ionicons.glyphMap }>;
  emptyText: string;
}) {
  const { theme } = useTheme();

  return (
    <FadeInView delay={170} style={[styles.activity, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <View style={styles.activityHeader}>
        <Text style={[styles.activityKicker, { color: theme.colors.primary }]}>fila de atenção</Text>
        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      {items.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" title="Tudo quieto por aqui" description={emptyText} />
      ) : (
        <View style={styles.activityItems}>
          {items.map((item, index) => (
            <FadeInView key={`${item.title}-${item.detail}`} delay={index * 55} distance={6} style={[styles.activityItem, { borderColor: theme.colors.border }]}> 
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(22,132,255,0.12)' }]}> 
                <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={[styles.activityItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.activityItemDetail, { color: theme.colors.textMuted }]}>{item.detail}</Text>
              </View>
            </FadeInView>
          ))}
        </View>
      )}
    </FadeInView>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; action?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.textMuted }]}>{description}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  spotlight: {
    minWidth: 320,
    flex: 1.2,
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    gap: 12,
    overflow: 'hidden',
  },
  spotlightGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.08,
    right: -90,
    top: -90,
  },
  spotlightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800',
  },
  kicker: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  spotlightTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  spotlightDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  spotlightChildren: {
    marginTop: 8,
  },
  chart: {
    minWidth: 340,
    flex: 1,
    borderWidth: 1,
    borderRadius: 32,
    padding: 22,
    gap: 18,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  chartKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  chartTitle: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  chartBadge: {
    minWidth: 76,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'flex-end',
  },
  chartBadgeValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  chartBadgeLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  barRow: {
    minHeight: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 9,
  },
  barTrack: {
    width: '100%',
    height: 155,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chartInsight: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  chartInsightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  activity: {
    minWidth: 320,
    flex: 1,
    borderWidth: 1,
    borderRadius: 32,
    padding: 22,
    gap: 16,
  },
  activityHeader: {
    gap: 5,
  },
  activityKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  activityItems: {
    gap: 10,
  },
  activityItem: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 13,
    flexDirection: 'row',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
    gap: 3,
  },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  activityItemDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'flex-start',
    gap: 10,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 4,
  },
});
