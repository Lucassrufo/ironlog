import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { Screen } from '../../components/ui/Screen';
import { calculateBmi } from '../../utils/bmi';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BmiResult'>;

function getStatusColor(status: string, fallback: string) {
  if (status === 'healthy') {
    return fallback;
  }

  if (status === 'above') {
    return '#F59E0B';
  }

  if (status === 'high') {
    return '#FF5A70';
  }

  return fallback;
}

export function BmiResultScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { draftUser } = useUser();
  const result = calculateBmi(draftUser.peso ?? 0, draftUser.altura ?? 0);
  const statusColor = result ? getStatusColor(result.status, theme.colors.primary) : theme.colors.textMuted;
  const isMinor = (draftUser.idade ?? 0) > 0 && (draftUser.idade ?? 0) < 20;

  return (
    <Screen>
      <OnboardingHeader
        step="Etapa 3 de 5"
        title="Seu resultado de IMC"
        subtitle="Esse cálculo usa seu peso e sua altura para criar um indicador inicial de acompanhamento."
      />

      <View style={[styles.resultPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: statusColor }]}>
          <Ionicons name="body-outline" size={34} color="#FFFFFF" />
        </View>

        <View style={styles.valueGroup}>
          <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>IMC</Text>
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>{result ? result.value.toFixed(1) : '--'}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{result?.label ?? 'Dados incompletos'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.headline, { color: theme.colors.text }]}>{result?.headline ?? 'Não foi possível calcular seu IMC.'}</Text>
        <Text style={[styles.description, { color: theme.colors.textMuted }]}>
          {result?.description ?? 'Volte uma etapa e confira altura e peso para continuar.'}
        </Text>

        <View style={[styles.referenceBox, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.referenceTitle, { color: theme.colors.text }]}>Faixa indicada</Text>
          <Text style={[styles.referenceText, { color: theme.colors.textMuted }]}>
            O intervalo de referência adulto fica entre 18,5 e 24,9. O IMC é um indicador geral e não substitui uma avaliação profissional.
          </Text>
          {isMinor ? (
            <Text style={[styles.referenceText, { color: theme.colors.textMuted }]}>
              Para menores de 20 anos, a interpretação ideal considera idade, sexo e curvas de crescimento.
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton label="Continuar" icon="arrow-forward" onPress={() => navigation.navigate('LevelSelection')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueGroup: {
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 56,
    fontWeight: '900',
  },
  statusPill: {
    minHeight: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(141,153,168,0.28)',
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  referenceBox: {
    width: '100%',
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  referenceText: {
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    marginTop: 'auto',
  },
});
