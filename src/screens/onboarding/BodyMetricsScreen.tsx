import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { Screen } from '../../components/ui/Screen';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BodyMetrics'>;

export function BodyMetricsScreen({ navigation }: Props) {
  const { draftUser, setDraftUser } = useUser();
  const [altura, setAltura] = useState(draftUser.altura ? String(draftUser.altura) : '');
  const [peso, setPeso] = useState(draftUser.peso ? String(draftUser.peso) : '');
  const canContinue = Number(altura) > 0 && Number(peso) > 0;

  return (
    <Screen>
      <OnboardingHeader
        step="Etapa 2 de 5"
        title="Ajuste seu perfil físico."
        subtitle="Altura e peso ajudam a calcular seu IMC e manter seu acompanhamento organizado."
      />

      <View style={styles.form}>
        <AppInput label="Altura (cm)" value={altura} placeholder="Ex: 175" keyboardType="decimal-pad" onChangeText={setAltura} />
        <AppInput label="Peso atual (kg)" value={peso} placeholder="Ex: 78" keyboardType="decimal-pad" onChangeText={setPeso} />
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Continuar"
          icon="arrow-forward"
          disabled={!canContinue}
          onPress={() => {
            setDraftUser({ altura: Number(altura.replace(',', '.')), peso: Number(peso.replace(',', '.')) });
            navigation.navigate('BmiResult');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 'auto',
  },
});
