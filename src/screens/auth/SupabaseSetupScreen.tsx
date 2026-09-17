import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SupabaseSetup'>;

export function SupabaseSetupScreen(_: Props) {
  const { enableLocalMode } = useAuth();
  const { theme } = useTheme();

  return (
    <WebAuthLayout
      eyebrow="Conexão da plataforma"
      title="Falta ligar o Supabase"
      subtitle="O portal web, o login, o chat e a relação treinador-aluno precisam das chaves públicas do projeto Free do Supabase."
    >
      <View style={styles.content}>
        <View style={[styles.codeBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}> 
          <Text style={[styles.codeTitle, { color: theme.colors.text }]}>Arquivo .env</Text>
          <Text style={[styles.codeText, { color: theme.colors.text }]}>EXPO_PUBLIC_SUPABASE_URL=</Text>
          <Text style={[styles.codeText, { color: theme.colors.text }]}>EXPO_PUBLIC_SUPABASE_ANON_KEY=</Text>
          <Text style={[styles.codeText, { color: theme.colors.textMuted }]}># também aceito: EXPO_PUBLIC_SUPABASE_KEY=</Text>
        </View>
        <Text style={[styles.copy, { color: theme.colors.textMuted }]}>Depois de salvar o .env, reinicie o Expo para as variáveis entrarem no bundle web.</Text>
        <AppButton label="Continuar em modo local" icon="phone-portrait-outline" onPress={enableLocalMode} />
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  copy: {
    fontSize: 15,
    lineHeight: 22,
  },
  codeBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  codeTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
