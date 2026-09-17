import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { AuthFeedback } from '../../components/web/AuthFeedback';
import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { resendSignupConfirmation } from '../../services/auth/authService';
import { getSafeAuthErrorMessage, validateStrongPassword } from '../../services/auth/authGuards';
import { RootStackParamList } from '../../types/navigation';
import { PlatformRole } from '../../types/platform';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type AuthMessage = { tone: 'success' | 'error' | 'info'; title: string; message: string } | null;

export function RegisterScreen({ navigation }: Props) {
  const { signInWithGoogle, signUp } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PlatformRole>('student');
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [feedback, setFeedback] = useState<AuthMessage>(null);

  async function handleSubmit() {
    const passwordValidation = validateStrongPassword(password);
    if (!name.trim() || !email.trim() || !passwordValidation.isValid) {
      const message = !name.trim() || !email.trim() ? 'Informe nome e email para criar o acesso.' : passwordValidation.message;
      setFeedback({ tone: 'error', title: 'Revise antes de continuar', message });
      Alert.alert('Revise os dados', message);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Criando sua conta', message: 'Estamos preparando o acesso e aplicando o papel escolhido.' });
      const result = await signUp({ name: name.trim(), email: email.trim(), password, role });
      if (result.needsEmailConfirmation) {
        setVerificationEmail(email.trim());
        setFeedback({ tone: 'success', title: 'Cadastro recebido', message: 'Enviamos um link de verificação. Confirme o email para liberar o portal.' });
      } else {
        setFeedback({ tone: 'success', title: 'Conta criada', message: 'Seu acesso foi criado e o portal está abrindo.' });
        Alert.alert('Conta criada', 'Seu acesso foi criado e o portal está abrindo.');
      }
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Não foi possível criar a conta', message });
      Alert.alert('Não foi possível criar a conta', message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Abrindo Google', message: 'Após confirmar a conta, você volta para escolher ou validar seu papel no IronLog.' });
      await signInWithGoogle({ role, name: name.trim() || undefined });
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Google não abriu', message });
      Alert.alert('Não foi possível abrir o Google', message);
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    if (!verificationEmail) {
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Reenviando email', message: 'Estamos solicitando um novo link de confirmação.' });
      await resendSignupConfirmation(verificationEmail);
      setFeedback({ tone: 'success', title: 'Email reenviado', message: 'Enviamos um novo link para o mesmo endereço. Confira também a caixa de spam.' });
      Alert.alert('Email reenviado', 'Enviamos um novo link de confirmação para o mesmo endereço.');
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Não foi possível reenviar', message });
      Alert.alert('Não foi possível reenviar', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (verificationEmail) {
    return (
      <WebAuthLayout
        eyebrow="Verificação de email"
        title="Confirme o email para liberar o portal"
        subtitle="O link mantém sua conta protegida. Depois de confirmar, volte para esta tela e entre com o mesmo email."
      >
        <View style={styles.form}>
          <AuthFeedback
            tone={feedback?.tone ?? 'success'}
            title={feedback?.title ?? 'Cadastro recebido'}
            message={feedback?.message ?? 'Enviamos um link de verificação para o endereço informado.'}
          />
          <View style={[styles.notice, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}> 
            <Text style={[styles.noticeTitle, { color: theme.colors.textMuted }]}>Email de confirmação</Text>
            <Text style={[styles.noticeEmail, { color: theme.colors.text }]}>{verificationEmail}</Text>
            <Text style={[styles.noticeCopy, { color: theme.colors.textMuted }]}>Se não aparecer em alguns minutos, confira spam ou peça um novo link aqui mesmo.</Text>
          </View>
          <AppButton label="Já confirmei, entrar" icon="log-in-outline" onPress={() => navigation.navigate('Login')} />
          <AppButton
            label={submitting ? 'Reenviando...' : 'Reenviar confirmação'}
            icon="mail-outline"
            variant="ghost"
            disabled={submitting}
            onPress={handleResendConfirmation}
          />
          <Pressable onPress={() => setVerificationEmail('')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>Trocar email</Text>
          </Pressable>
        </View>
      </WebAuthLayout>
    );
  }

  return (
    <WebAuthLayout
      eyebrow="Novo acesso"
      title="Crie sua base no IronLog"
      subtitle="Escolha o papel certo agora. Isso separa permissões, telas e dados desde o primeiro login."
    >
      <View style={styles.form}>
        <View style={[styles.roleSelector, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}> 
          {(['student', 'trainer'] as PlatformRole[]).map((item) => {
            const selected = role === item;
            return (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleOption, selected ? { backgroundColor: theme.colors.primary } : null]}>
                <Text style={[styles.roleText, { color: selected ? '#FFFFFF' : theme.colors.text }]}> 
                  {item === 'trainer' ? 'Treinador' : 'Aluno'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppInput label="Nome" value={name} placeholder="Como você quer aparecer" onChangeText={setName} />
        <AppButton label="Registrar com Google" icon="logo-google" variant="ghost" disabled={submitting} onPress={handleGoogle} />
        <View style={styles.separator}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.separatorText, { color: theme.colors.textMuted }]}>ou use email e senha</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        </View>
        <AppInput label="Email" value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
        <AppInput label="Senha" value={password} secureTextEntry autoCapitalize="none" onChangeText={setPassword} />
        {feedback ? <AuthFeedback tone={feedback.tone} title={feedback.title} message={feedback.message} /> : null}
        <AppButton label={submitting ? 'Criando...' : 'Criar conta'} icon="person-add-outline" disabled={submitting} onPress={handleSubmit} />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>Já tenho conta</Text>
        </Pressable>
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  roleSelector: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 5,
  },
  roleOption: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
  },
  notice: {
    borderWidth: 1,
    borderRadius: 18,
    gap: 8,
    padding: 16,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  noticeEmail: {
    fontSize: 16,
    fontWeight: '900',
  },
  noticeCopy: {
    fontSize: 13,
    lineHeight: 19,
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
