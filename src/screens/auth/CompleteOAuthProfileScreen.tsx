import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { AuthFeedback } from '../../components/web/AuthFeedback';
import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { getSafeAuthErrorMessage } from '../../services/auth/authGuards';
import { RootStackParamList } from '../../types/navigation';
import { PlatformRole } from '../../types/platform';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteOAuthProfile'>;
type AuthMessage = { tone: 'success' | 'error' | 'info'; title: string; message: string } | null;

export function CompleteOAuthProfileScreen(_: Props) {
  const { completeOAuthProfile, session, signOut } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState(session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? '');
  const [role, setRole] = useState<PlatformRole>('student');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthMessage>(null);

  async function handleSubmit() {
    if (name.trim().length < 2) {
      const message = 'Use pelo menos 2 caracteres para liberar seu acesso.';
      setFeedback({ tone: 'error', title: 'Nome muito curto', message });
      Alert.alert('Informe seu nome', message);
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ tone: 'info', title: 'Liberando acesso', message: 'Estamos salvando seu papel e preparando o portal correto.' });
      await completeOAuthProfile({ name: name.trim(), role });
      setFeedback({ tone: 'success', title: 'Perfil pronto', message: 'Seu acesso foi liberado. O portal vai abrir em seguida.' });
      Alert.alert('Perfil pronto', 'Seu acesso foi liberado. O portal vai abrir em seguida.');
    } catch (error) {
      const message = getSafeAuthErrorMessage(error);
      setFeedback({ tone: 'error', title: 'Não foi possível concluir', message });
      Alert.alert('Não foi possível concluir', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WebAuthLayout
      eyebrow="Perfil Google"
      title="Diga como este acesso será usado"
      subtitle="Seu email já entrou com segurança. Falta só definir se esta conta opera como aluno ou treinador."
    >
      <View style={styles.form}>
        <View style={[styles.roleSelector, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}> 
          {(['student', 'trainer'] as PlatformRole[]).map((item) => {
            const selected = role === item;
            return (
              <Pressable
                key={item}
                onPress={() => setRole(item)}
                style={[styles.roleOption, selected ? { backgroundColor: theme.colors.primary } : null]}
              >
                <Text style={[styles.roleText, { color: selected ? '#FFFFFF' : theme.colors.textMuted }]}> 
                  {item === 'trainer' ? 'Treinador' : 'Aluno'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppInput label="Nome exibido" value={name} onChangeText={setName} />
        {feedback ? <AuthFeedback tone={feedback.tone} title={feedback.title} message={feedback.message} /> : null}
        <AppButton label={submitting ? 'Salvando...' : 'Liberar meu acesso'} icon="shield-checkmark-outline" disabled={submitting} onPress={handleSubmit} />
        <AppButton label="Sair desta conta" icon="log-out-outline" variant="ghost" onPress={signOut} />
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
