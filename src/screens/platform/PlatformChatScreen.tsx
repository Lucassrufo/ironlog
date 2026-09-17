import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { WebDashboardLayout, WebPanel } from '../../components/web/WebDashboardLayout';
import { RootStackParamList } from '../../types/navigation';
import { sendMessage } from '../../services/platform/chatService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PlatformChat'>;

export function PlatformChatScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { platformProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    if (!route.params?.threadId || !platformProfile || !message.trim()) {
      Alert.alert('Chat ainda não conectado', 'Abra uma conversa válida depois de vincular treinador e aluno.');
      return;
    }

    try {
      setSubmitting(true);
      await sendMessage(route.params.threadId, platformProfile.id, message.trim());
      setMessage('');
    } catch (error) {
      Alert.alert('Não foi possível enviar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WebDashboardLayout
      eyebrow="Mensagens"
      title="Chat"
      subtitle="Conversa direta entre aluno e treinador vinculado. Sem grupo, sem feed e sem ruído."
      userName={platformProfile?.name}
      navItems={[
        {
          label: platformProfile?.role === 'trainer' ? 'Visão geral' : 'Resultados',
          icon: platformProfile?.role === 'trainer' ? 'grid-outline' : 'analytics-outline',
          onPress: () => navigation.navigate(platformProfile?.role === 'trainer' ? 'TrainerDashboard' : 'StudentPortal'),
        },
        {
          label: platformProfile?.role === 'trainer' ? 'Alunos' : 'Treino',
          icon: platformProfile?.role === 'trainer' ? 'people-outline' : 'barbell-outline',
          onPress: () => navigation.navigate(platformProfile?.role === 'trainer' ? 'TrainerStudents' : 'Dashboard'),
        },
        { label: 'Chat', icon: 'chatbubble-outline', active: true, onPress: () => navigation.navigate('PlatformChat') },
      ]}
      actions={<AppButton label="Voltar" icon="chevron-back" variant="ghost" onPress={() => navigation.goBack()} />}
    >
      <WebPanel>
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Conversa do treino</Text>
          <Text style={[styles.copy, { color: theme.colors.textMuted }]}>Use este espaço para ajuste de treino, dúvidas de execução e combinados da semana.</Text>
        </View>
        <AppInput label="Mensagem" value={message} onChangeText={setMessage} />
        <AppButton label={submitting ? 'Enviando...' : 'Enviar'} icon="send-outline" disabled={submitting} onPress={handleSend} />
      </WebPanel>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  empty: {
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
  },
});

