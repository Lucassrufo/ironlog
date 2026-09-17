import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components/ui/AppButton';
import { RootStackParamList } from '../../types/navigation';
import { formatDuration } from './DashboardScreen';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutComplete'>;

const confetti = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 31) % 84),
  delay: (index % 9) * 90,
  size: 5 + (index % 4) * 3,
  color: ['#1684FF', '#63B3FF', '#F7FBFF', '#FF5A70', '#F59E0B'][index % 5],
}));

export function WorkoutCompleteScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { workoutPosts } = useUser();
  const post = workoutPosts.find((item) => item.data === route.params.completedAt);
  const scale = useRef(new Animated.Value(0.76)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const confettiFall = useMemo(() => confetti.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 48,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      ...confettiFall.map((value, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(confetti[index].delay),
            Animated.timing(value, {
              toValue: 1,
              duration: 2200,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 },
        ),
      ),
    ]).start();
  }, [confettiFall, opacity, scale]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.confettiLayer}>
        {confetti.map((piece, index) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confetti,
              {
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * 2,
                backgroundColor: piece.color,
                opacity,
                transform: [
                  {
                    translateY: confettiFall[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-80, 280],
                    }),
                  },
                  {
                    rotate: confettiFall[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${180 + index * 20}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.checkCircle, { backgroundColor: theme.colors.primary, opacity, transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={34} color="#FFFFFF" />
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Bom trabalho!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Mandou bem no treino.</Text>
        </Animated.View>

        {post ? (
          <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <SummaryItem label="Duração" value={formatDuration(post.durationSeconds)} />
            <SummaryItem label="Volume" value={`${Math.round(post.totalVolumeKg)} kg`} />
            <SummaryItem label="Reps" value={String(post.totalReps)} />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <AppButton label="Voltar ao meu plano" icon="home-outline" onPress={() => navigation.replace('Dashboard')} />
        <Pressable onPress={() => navigation.replace('Profile')} style={styles.profileLink}>
          <Text style={[styles.profileText, { color: theme.colors.textMuted }]}>Ver postagem no perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 170,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 18,
  },
  checkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '800',
  },
  summary: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  profileLink: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
