import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '../motion/FadeInView';
import { useTheme } from '../../context/ThemeContext';

interface WebAuthLayoutProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
}

const briefRows = [
  { time: '07:10', title: 'Plano do dia', detail: 'alunos, rotina e mensagens em uma fila limpa' },
  { time: '12:30', title: 'Sinal de treino', detail: 'volume, frequencia e adesao sem planilha solta' },
  { time: '19:45', title: 'Próximo passo', detail: 'ajuste a ficha antes da próxima sessão' },
];

export function WebAuthLayout({ eyebrow, title, subtitle, children }: WebAuthLayoutProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 980;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.root}>
        <View style={[styles.orbPrimary, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.orbGreen, { backgroundColor: theme.colors.success }]} />
        <View style={[styles.orbSoft, { borderColor: theme.colors.border }]} />

        <View style={[styles.shell, isWide ? styles.shellWide : styles.shellNarrow]}>
          <FadeInView
            distance={16}
            style={[
              styles.brandPanel,
              { borderColor: theme.colors.border, backgroundColor: 'rgba(13, 18, 28, 0.72)' },
              isWide ? styles.brandPanelWide : styles.brandPanelNarrow,
            ]}
          >
            <View style={styles.brandTop}>
              <View>
                <Text style={[styles.logoMark, { color: theme.colors.text }]}>IRONLOG</Text>
                <Text style={[styles.logoCaption, { color: theme.colors.textMuted }]}>training operations</Text>
              </View>
              <View style={[styles.logoPill, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated }]}> 
                <View style={[styles.liveDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.logoPillText, { color: theme.colors.primary }]}>workspace</Text>
              </View>
            </View>

            <View style={styles.brandCopy}>
              <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>Rotina conectada</Text>
              <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Treino, progresso e conversa no mesmo ritmo.</Text>
              <Text style={[styles.brandText, { color: theme.colors.textMuted }]}>O treinador abre o dia com contexto. O aluno registra pelo app. A web mostra o que precisa de acao, sem depender de conversa perdida.</Text>
            </View>

            <FadeInView delay={130} distance={10} style={[styles.briefCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
              <View style={styles.briefHeader}>
                <View>
                  <Text style={[styles.briefKicker, { color: theme.colors.primary }]}>LIVE BRIEF</Text>
                  <Text style={[styles.briefTitle, { color: theme.colors.text }]}>O que merece atencao</Text>
                </View>
                <View style={[styles.demoPill, { borderColor: theme.colors.border }]}> 
                  <Text style={[styles.demoPillText, { color: theme.colors.textMuted }]}>dados seguros</Text>
                </View>
              </View>
              <View style={styles.briefRows}>
                {briefRows.map((row, index) => (
                  <FadeInView key={row.time} delay={190 + index * 70} distance={8} style={[styles.briefRow, { borderColor: theme.colors.border }]}> 
                    <Text style={[styles.briefTime, { color: theme.colors.primary }]}>{row.time}</Text>
                    <View style={styles.briefCopy}>
                      <Text style={[styles.briefRowTitle, { color: theme.colors.text }]}>{row.title}</Text>
                      <Text style={[styles.briefRowDetail, { color: theme.colors.textMuted }]}>{row.detail}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={15} color={theme.colors.textMuted} />
                  </FadeInView>
                ))}
              </View>
            </FadeInView>

            <View style={styles.signalGrid}>
              {['Acesso por papel', 'Sessao protegida', 'Sem custo inicial'].map((item) => (
                <View key={item} style={[styles.signal, { borderColor: theme.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}> 
                  <Text style={[styles.signalText, { color: theme.colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>
          </FadeInView>

          <FadeInView
            delay={110}
            distance={18}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, isWide ? styles.cardWide : null]}
          >
            <View style={styles.cardIntro}>
              <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{eyebrow}</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={styles.content}>{children}</View>
          </FadeInView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 22,
  },
  orbPrimary: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 999,
    opacity: 0.15,
    right: -150,
    top: -150,
  },
  orbGreen: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.08,
    left: -80,
    bottom: -90,
  },
  orbSoft: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.22,
    left: '38%',
    top: -310,
  },
  shell: {
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },
  shellWide: {
    maxWidth: 1220,
    minHeight: 680,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  shellNarrow: {
    maxWidth: 610,
  },
  brandPanel: {
    borderWidth: 1,
    borderRadius: 38,
    padding: 30,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
  },
  brandPanelWide: {
    flex: 1,
  },
  brandPanelNarrow: {
    minHeight: 480,
  },
  brandTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoMark: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  logoCaption: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logoPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  logoPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  brandCopy: {
    gap: 16,
    maxWidth: 560,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: 54,
    lineHeight: 56,
    fontWeight: '900',
    letterSpacing: -2.3,
  },
  brandText: {
    maxWidth: 520,
    fontSize: 16,
    lineHeight: 25,
  },
  briefCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 16,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  briefKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  briefTitle: {
    marginTop: 5,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  demoPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  briefRows: {
    gap: 10,
  },
  briefRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  briefTime: {
    width: 44,
    fontSize: 12,
    fontWeight: '900',
  },
  briefCopy: {
    flex: 1,
    gap: 2,
  },
  briefRowTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  briefRowDetail: {
    fontSize: 12,
    lineHeight: 17,
  },
  signalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  signal: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 38,
    padding: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 22 },
  },
  cardWide: {
    width: 470,
  },
  cardIntro: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  content: {
    marginTop: 24,
  },
});

