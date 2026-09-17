import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { WebAuthLayout } from '../../components/web/WebAuthLayout';
import { useTheme } from '../../context/ThemeContext';

export function AuthLoadingScreen() {
  const { theme } = useTheme();

  return (
    <WebAuthLayout
      eyebrow="Sessão protegida"
      title="Preparando seu espaço"
      subtitle="Estamos checando a sessão e carregando o papel correto antes de mostrar dados do portal."
    >
      <View style={styles.loading}>
        <View style={[styles.loaderRing, { borderColor: theme.colors.border }]}> 
          <ActivityIndicator color={theme.colors.primary} />
        </View>
        <Text style={[styles.text, { color: theme.colors.text }]}>Só um instante</Text>
        <Text style={[styles.copy, { color: theme.colors.textMuted }]}>Seus dados aparecem assim que as permissões terminarem de sincronizar.</Text>
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loaderRing: {
    width: 54,
    height: 54,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '900',
  },
  copy: {
    maxWidth: 280,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
});
