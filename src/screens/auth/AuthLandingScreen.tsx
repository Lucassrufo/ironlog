import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLanding'>;

export function AuthLandingScreen({ navigation }: Props) {
  return (
    <WebAuthLayout
      eyebrow="IronLog online"
      title="A rotina sai do improviso"
      subtitle="Treinador define o plano, aluno registra pelo app e o portal mostra o que mudou de verdade."
    >
      <View style={styles.actions}>
        <AppButton label="Entrar" icon="log-in-outline" onPress={() => navigation.navigate('Login')} />
        <AppButton label="Criar conta" icon="person-add-outline" variant="ghost" onPress={() => navigation.navigate('Register')} />
      </View>
      <Text style={styles.finePrint}>Cada conta entra com permissão própria. Aluno não acessa área de treinador; treinador só acompanha alunos vinculados.</Text>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  finePrint: {
    marginTop: 18,
    color: '#7D8998',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
