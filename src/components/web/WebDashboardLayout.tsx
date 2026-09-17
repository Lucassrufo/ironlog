import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '../motion/FadeInView';
import { useTheme } from '../../context/ThemeContext';

type DashboardNavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
};

interface WebDashboardLayoutProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  eyebrow: string;
  userName?: string;
  navItems: DashboardNavItem[];
  actions?: ReactNode;
}

export function WebDashboardLayout({ title, subtitle, eyebrow, userName, navItems, actions, children }: WebDashboardLayoutProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.orbPrimary, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.orbSuccess, { backgroundColor: theme.colors.success }]} />
      <View style={[styles.gridGlow, { borderColor: theme.colors.border }]} />

      <View style={[styles.shell, isWide ? styles.shellWide : styles.shellNarrow]}>
        <FadeInView
          distance={12}
          style={[styles.sidebar, { backgroundColor: 'rgba(16, 22, 33, 0.88)', borderColor: theme.colors.border }, isWide ? styles.sidebarWide : null]}
        >
          <View style={styles.sidebarTop}>
            <View>
              <Text style={[styles.brand, { color: theme.colors.text }]}>IRONLOG</Text>
              <Text style={[styles.brandCaption, { color: theme.colors.textMuted }]}>coach workspace</Text>
            </View>
            <View style={[styles.userBadge, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
              <View style={[styles.userDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.role, { color: theme.colors.textMuted }]} numberOfLines={1}>{userName ?? 'Portal ativo'}</Text>
            </View>
          </View>

          <View style={styles.navBlock}>
            <Text style={[styles.navKicker, { color: theme.colors.textMuted }]}>menu</Text>
            <View style={styles.nav}>
              {navItems.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.navItem,
                    {
                      backgroundColor: item.active ? theme.colors.primary : pressed ? theme.colors.surfaceElevated : 'transparent',
                      borderColor: item.active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={18} color={item.active ? '#FFFFFF' : theme.colors.textMuted} />
                  <Text style={[styles.navLabel, { color: item.active ? '#FFFFFF' : theme.colors.text }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.sidebarBrief, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.sidebarBriefLabel, { color: theme.colors.primary }]}>brief</Text>
            <Text style={[styles.sidebarBriefTitle, { color: theme.colors.text }]}>Abra, decida, siga.</Text>
            <Text style={[styles.sidebarBriefCopy, { color: theme.colors.textMuted }]}>Os cards destacam o que precisa de acao antes do proximo treino.</Text>
          </View>
        </FadeInView>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FadeInView delay={80} distance={12} style={[styles.header, isWide ? styles.headerWide : null]}>
            <View style={styles.headerCopy}>
              <View style={styles.headerTopLine}>
                <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{eyebrow}</Text>
                <View style={[styles.statusPill, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
                  <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                  <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>sincronizacao pronta</Text>
                </View>
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
            </View>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </FadeInView>
          <FadeInView delay={150} distance={12}>
            {children}
          </FadeInView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function WebPanel({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  return (
    <FadeInView distance={8} duration={320} style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      {children}
    </FadeInView>
  );
}

export function WebMetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  const { theme } = useTheme();
  return (
    <FadeInView distance={10} duration={360} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <View style={styles.metricTop}>
        <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        <View style={[styles.metricIcon, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
          <Ionicons name="pulse-outline" size={16} color={theme.colors.primary} />
        </View>
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.metricDetail, { color: theme.colors.textMuted }]}>{detail}</Text>
      <View style={[styles.metricRule, { backgroundColor: theme.colors.border }]}> 
        <View style={[styles.metricRuleFill, { backgroundColor: theme.colors.primary }]} />
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    overflow: 'hidden',
  },
  orbPrimary: {
    position: 'absolute',
    top: -180,
    right: -140,
    width: 410,
    height: 410,
    borderRadius: 999,
    opacity: 0.13,
  },
  orbSuccess: {
    position: 'absolute',
    bottom: -180,
    left: 150,
    width: 360,
    height: 360,
    borderRadius: 999,
    opacity: 0.07,
  },
  gridGlow: {
    position: 'absolute',
    top: 70,
    left: '45%',
    width: 520,
    height: 520,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.16,
  },
  shell: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  shellWide: {
    maxWidth: 1480,
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  shellNarrow: {
    padding: 14,
    gap: 14,
  },
  sidebar: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 20,
    gap: 26,
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 22 },
  },
  sidebarWide: {
    width: 282,
  },
  sidebarTop: {
    gap: 16,
  },
  brand: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  brandCaption: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  role: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  userBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  navBlock: {
    gap: 10,
  },
  navKicker: {
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  nav: {
    gap: 10,
  },
  navItem: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  sidebarBrief: {
    marginTop: 'auto',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 7,
  },
  sidebarBriefLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sidebarBriefTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sidebarBriefCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingBottom: 20,
  },
  header: {
    gap: 18,
  },
  headerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCopy: {
    maxWidth: 800,
  },
  headerTopLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  subtitle: {
    marginTop: 9,
    maxWidth: 670,
    fontSize: 15,
    lineHeight: 23,
  },
  actions: {
    minWidth: 180,
    gap: 10,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 21,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  metric: {
    minWidth: 210,
    flex: 1,
    borderWidth: 1,
    borderRadius: 26,
    padding: 19,
    gap: 9,
    overflow: 'hidden',
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  metricDetail: {
    minHeight: 38,
    fontSize: 13,
    lineHeight: 19,
  },
  metricRule: {
    marginTop: 4,
    height: 3,
    borderRadius: 99,
    overflow: 'hidden',
  },
  metricRuleFill: {
    width: '54%',
    height: '100%',
    borderRadius: 99,
  },
});

