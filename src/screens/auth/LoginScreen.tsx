import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { AuthFeedback } from '../../components/web/AuthFeedback';
import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { getSafeAuthErrorMessage } from '../../services/auth/authGuards';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type AuthMessage = { tone: 'success' | 'error' | 'info'; title: string; message: string } | null;

export function LoginScreen({ navigation }: Props) {
  const { signIn, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthMessage>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      const message = 'Preencha email e senha para entrar no IronLog.';
      setFeedback({ tone: 'error', title: 'Faltam dados para entrar', message });
      Alert.alert('Revise o acesso', message);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Conferindo seu acesso', message: 'Estamos validando email, senha e permissões do portal.' });
      await signIn(email.trim(), password);
      setFeedback({ tone: 'success', title: 'Login confirmado', message: 'Tudo certo. Seu portal está abrindo agora.' });
      Alert.alert('Login confirmado', 'Tudo certo. Seu portal está abrindo agora.');
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Não foi possível entrar', message });
      Alert.alert('Não foi possível entrar', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Abrindo Google', message: 'Você será levado para confirmar a conta e volta para o IronLog em seguida.' });
      await signInWithGoogle();
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Google não abriu', message });
      Alert.alert('Não foi possível abrir o Google', message);
      setSubmitting(false);
    }
  }

  return (
    <WebAuthLayout
      eyebrow="Acesso ao portal"
      title="Entre sem perder o ritmo"
      subtitle="Use a mesma conta na web e no aplicativo. Treinadores cuidam da operação; alunos acompanham evolução e conversam pelo portal."
    >
      <View style={styles.form}>
        <AppButton label="Continuar com Google" icon="logo-google" variant="ghost" disabled={submitting} onPress={handleGoogle} />
        <View style={styles.separator}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.separatorText, { color: theme.colors.textMuted }]}>ou entre com email</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        </View>
        <AppInput label="Email" value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
        <AppInput label="Senha" value={password} secureTextEntry autoCapitalize="none" onChangeText={setPassword} />
        {feedback ? <AuthFeedback tone={feedback.tone} title={feedback.title} message={feedback.message} /> : null}
        <AppButton label={submitting ? 'Entrando...' : 'Entrar no IronLog'} icon="log-in-outline" disabled={submitting} onPress={handleSubmit} />
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Criar uma conta</Text>
        </Pressable>
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 2,
  },
  line: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
