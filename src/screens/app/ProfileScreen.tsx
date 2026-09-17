import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { BottomTabBar, bottomTabPadding } from '../../components/navigation/BottomTabBar';
import { RootStackParamList } from '../../types/navigation';
import { calculateBmi, parseMetricValue } from '../../utils/bmi';
import { formatDuration } from './DashboardScreen';
import { levelContent } from '../../data/levels';
import { validateProfileInput } from '../../utils/profileValidation';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { workoutSplitContent } from '../../data/workouts';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface ExerciseProgress {
  exerciseName: string;
  firstKg: number;
  bestKg: number;
}

function getBmiColor(status: string | undefined, fallback: string) {
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

export function ProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, records, workoutPosts, updateUserProfile, resetAccount } = useUser();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [sobrenome, setSobrenome] = useState(user?.sobrenome ?? '');
  const [altura, setAltura] = useState(user?.altura ? String(user.altura) : '');
  const [peso, setPeso] = useState(user?.peso ? String(user.peso) : '');
  const [fotoUri, setFotoUri] = useState(user?.fotoUri ?? '');
  const bmiResult = useMemo(() => calculateBmi(parseMetricValue(peso), parseMetricValue(altura)), [altura, peso]);

  const sessions = useMemo(() => {
    const grouped = new Map<string, { data: string; workoutTitle: string; durationSeconds: number; totalKg: number }>();

    records.forEach((record) => {
      if (!grouped.has(record.data)) {
        grouped.set(record.data, {
          data: record.data,
          workoutTitle: record.workoutTitle,
          durationSeconds: record.durationSeconds,
          totalKg: 0,
        });
      }

      const current = grouped.get(record.data);
      if (current) {
        current.totalKg += record.volumeKg ?? record.cargaKg * record.series * record.repeticoes;
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  }, [records]);

  const progress = useMemo<ExerciseProgress[]>(() => {
    const grouped = new Map<string, { firstKg: number; bestKg: number }>();

    records.forEach((record) => {
      const current = grouped.get(record.exerciseName);
      if (!current) {
        grouped.set(record.exerciseName, { firstKg: record.cargaKg, bestKg: record.cargaKg });
        return;
      }

      current.bestKg = Math.max(current.bestKg, record.cargaKg);
    });

    return Array.from(grouped.entries())
      .map(([exerciseName, value]) => ({ exerciseName, ...value }))
      .filter((item) => item.bestKg > 0)
      .sort((a, b) => b.bestKg - a.bestKg)
      .slice(0, 5);
  }, [records]);

  if (!user) {
    return null;
  }

  const currentUser = user;
  const bmiColor = getBmiColor(bmiResult?.status, theme.colors.primary);

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para definir sua foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });

    if (result.canceled) {
      return;
    }

    const pickedUri = result.assets[0]?.uri;
    if (!pickedUri || !FileSystem.documentDirectory) {
      return;
    }

    const extension = pickedUri.split('.').pop()?.split('?')[0] || 'jpg';
    const localUri = `${FileSystem.documentDirectory}ironlog-profile-${currentUser.id}.${extension}`;

    await FileSystem.copyAsync({ from: pickedUri, to: localUri });
    setFotoUri(localUri);
    await updateUserProfile({ fotoUri: localUri });
  }

  async function handleSave() {
    const validation = validateProfileInput({ nome, sobrenome, altura, peso });

    if (!validation.ok) {
      Alert.alert('Revise seu perfil', validation.errors.join('\n'));
      return;
    }

    await updateUserProfile(validation.value);
    Alert.alert('Perfil atualizado', 'Seus dados foram salvos.');
  }

  async function deleteLocalImage(uri?: string) {
    if (!uri?.startsWith(FileSystem.documentDirectory ?? '')) {
      return;
    }

    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // Best-effort cleanup. Account reset must continue even if a stale file is already gone.
    }
  }

  function handleResetAccount() {
    Alert.alert(
      'Resetar conta?',
      'Isso vai apagar seu perfil e histórico de treinos para começar desde o início.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            await Promise.all([deleteLocalImage(currentUser.fotoUri), ...workoutPosts.map((post) => deleteLocalImage(post.photoUri))]);
            await resetAccount();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
        </Pressable>

        <View style={styles.profileHeader}>
          <Pressable
            accessibilityRole="button"
            style={[styles.avatar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handlePickPhoto}
          >
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={38} color={theme.colors.primary} />
            )}
            <View style={[styles.cameraBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </View>
          </Pressable>
          <View style={styles.profileTitle}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Perfil</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Dados, histórico e evolução de carga.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <AppInput label="Nome" value={nome} onChangeText={setNome} />
          <AppInput label="Sobrenome" value={sobrenome} onChangeText={setSobrenome} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput label="Altura (cm)" value={altura} keyboardType="decimal-pad" onChangeText={setAltura} />
            </View>
            <View style={styles.flex}>
              <AppInput label="Peso (kg)" value={peso} keyboardType="decimal-pad" onChangeText={setPeso} />
            </View>
          </View>
          <AppButton label="Salvar Perfil" icon="save-outline" onPress={handleSave} />
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.bmiHeader}>
            <View>
              <Text style={[styles.panelLabel, { color: theme.colors.textMuted }]}>IMC atual</Text>
              <Text style={[styles.bmiValue, { color: theme.colors.text }]}>{bmiResult ? bmiResult.value.toFixed(1) : '--'}</Text>
            </View>
            <View style={[styles.bmiBadge, { backgroundColor: bmiColor }]}>
              <Text style={styles.bmiBadgeText}>{bmiResult?.label ?? 'Sem dados'}</Text>
            </View>
          </View>
          <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
            {bmiResult?.headline ?? 'Informe altura e peso para calcular seu IMC.'}
          </Text>
          <Text style={[styles.bmiDescription, { color: theme.colors.textMuted }]}>
            {bmiResult
              ? `${bmiResult.description} Faixa adulta indicada: 18,5 a 24,9.`
              : 'O cálculo aparece automaticamente quando os campos estiverem preenchidos.'}
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.panelLabel, { color: theme.colors.textMuted }]}>Treino atual</Text>
          <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
            {levelContent[user.nivelAtual].title} · {workoutSplitContent[user.workoutSplit ?? 'normal'].title}
          </Text>
          <AppButton
            label="Alterar categoria ou tipo de treino"
            icon="options-outline"
            variant="ghost"
            onPress={() => navigation.navigate('TrainingPreferences')}
          />
        </View>

        <SectionTitle title="Dashboard de evolução" />
        <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {progress.length === 0 ? (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Conclua treinos com carga para gerar seu gráfico.</Text>
          ) : (
            progress.map((item) => {
              const gain = item.bestKg - item.firstKg;
              const highestKg = Math.max(...progress.map((row) => row.bestKg));
              const width = Math.min(100, Math.max(12, (item.bestKg / highestKg) * 100));

              return (
                <View key={item.exerciseName} style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{item.exerciseName}</Text>
                    <Text style={[styles.kgValue, { color: theme.colors.primary }]}>
                      {item.bestKg} kg {gain > 0 ? `(+${gain})` : ''}
                    </Text>
                  </View>
                  <View style={[styles.chartTrack, { backgroundColor: theme.colors.surfaceElevated }]}>
                    <View style={[styles.chartFill, { backgroundColor: theme.colors.primary, width: `${width}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <SectionTitle title="Treinos concluídos" />
        <View style={styles.feed}>
          {workoutPosts.length === 0 ? (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Suas postagens de treino aparecem aqui.</Text>
          ) : (
            workoutPosts.map((post) => (
              <View key={post.id} style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.avatarImage} /> : <Ionicons name="person" size={22} color={theme.colors.primary} />}
                  </View>
                  <View style={styles.postHeaderCopy}>
                    <Text style={[styles.postName, { color: theme.colors.text }]}>{user.nome} {user.sobrenome}</Text>
                    <Text style={[styles.postDate, { color: theme.colors.textMuted }]}>
                      {new Date(post.data).toLocaleDateString('pt-BR')} · {post.workoutTitle}
                    </Text>
                  </View>
                </View>
                {post.photoUri ? <Image source={{ uri: post.photoUri }} style={styles.postImage} /> : null}
                <View style={styles.postMetrics}>
                  <PostMetric label="Duração" value={formatDuration(post.durationSeconds)} />
                  <PostMetric label="Volume" value={`${Math.round(post.totalVolumeKg)} kg`} />
                  <PostMetric label="Reps" value={String(post.totalReps)} />
                </View>
              </View>
            ))
          )}
        </View>

        <SectionTitle title="Histórico técnico" />
        <View style={styles.sessions}>
          {sessions.length === 0 ? (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum treino encerrado ainda.</Text>
          ) : (
            sessions.map((session) => (
              <Pressable
                key={session.data}
                onPress={() => navigation.navigate('WorkoutSummary', { completedAt: session.data })}
                style={[styles.sessionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>{session.workoutTitle}</Text>
                <Text style={[styles.sessionMeta, { color: theme.colors.textMuted }]}>
                  {new Date(session.data).toLocaleDateString('pt-BR')} · {formatDuration(session.durationSeconds)} · {session.totalKg} kg somados
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <AppButton label="Resetar conta" icon="trash-outline" variant="danger" onPress={handleResetAccount} />
      </ScrollView>
      <BottomTabBar active="Profile" />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { theme } = useTheme();

  return <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>;
}

function PostMetric({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.postMetric}>
      <Text style={[styles.postMetricValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.postMetricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
    paddingBottom: bottomTabPadding,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
  },
  backText: {
    fontSize: 15,
    fontWeight: '800',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bmiValue: {
    fontSize: 42,
    fontWeight: '900',
  },
  bmiBadge: {
    minHeight: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bmiBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bmiDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressItem: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  kgValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  chartTrack: {
    height: 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 8,
  },
  sessions: {
    gap: 10,
  },
  feed: {
    gap: 12,
  },
  postCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  postName: {
    fontSize: 15,
    fontWeight: '900',
  },
  postDate: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  postImage: {
    width: '100%',
    height: 210,
    borderRadius: 8,
  },
  postMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  postMetric: {
    flex: 1,
    gap: 3,
  },
  postMetricValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  postMetricLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sessionCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  sessionMeta: {
    fontSize: 13,
    lineHeight: 19,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
