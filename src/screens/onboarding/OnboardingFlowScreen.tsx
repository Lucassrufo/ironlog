import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components/ui/AppButton';
import { MuscleDiagram } from '../../components/training/MuscleDiagram';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import {
  BodyFocus,
  CurrentTrainingFrequency,
  ExperienceLevel,
  FitnessGoal,
  GenderIdentity,
  OnboardingProfile,
  PlanMode,
  SessionDuration,
  TrainingExperience,
  TrainingLocation,
  WorkoutSplit,
} from '../../types/models';
import { OnboardingStackParamList } from '../../types/navigation';
import { calculateBmi, parseMetricValue } from '../../utils/bmi';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingFlow'>;
type IconName = keyof typeof Ionicons.glyphMap;

type OnboardingForm = Omit<OnboardingProfile, 'nivelAtual' | 'workoutSplit'>;

interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon: IconName;
  badge?: string;
}

const TOTAL_STEPS = 13;

const genderOptions: ChoiceOption<GenderIdentity>[] = [
  { value: 'masculino', title: 'Masculino', icon: 'male-outline' },
  { value: 'feminino', title: 'Feminino', icon: 'female-outline' },
  { value: 'outro', title: 'Outro', icon: 'person-outline' },
];

const experienceOptions: ChoiceOption<TrainingExperience>[] = [
  { value: 'iniciante', title: 'Iniciante', description: 'Menos de 1 ano de treino.', icon: 'walk-outline' },
  { value: 'intermediario', title: 'Intermediário', description: 'Entre 1 e 2 anos de treino.', icon: 'barbell-outline' },
  { value: 'avancado', title: 'Avançado', description: 'Mais de 2 anos de consistência.', icon: 'trophy-outline' },
];

const currentFrequencyOptions: ChoiceOption<CurrentTrainingFrequency>[] = [
  {
    value: 'regularmente',
    title: 'Regularmente',
    description: 'Treino pelo menos 2 vezes por semana.',
    icon: 'calendar-outline',
  },
  {
    value: 'inconsistente',
    title: 'Inconsistentemente',
    description: 'Algumas semanas sim, outras não.',
    icon: 'pulse-outline',
  },
  { value: 'nunca', title: 'Nunca', description: 'Estou parado há mais de 6 meses.', icon: 'pause-circle-outline' },
];

const goalOptions: ChoiceOption<FitnessGoal>[] = [
  { value: 'conditioning', title: 'Melhorar condicionamento', description: 'Mais fôlego e disposição.', icon: 'heart-outline' },
  { value: 'strength', title: 'Ficar mais forte', description: 'Evoluir cargas e técnica.', icon: 'flash-outline' },
  { value: 'definition', title: 'Definir o corpo', description: 'Secar com massa magra.', icon: 'body-outline' },
  { value: 'muscle', title: 'Ganhar músculos', description: 'Mais volume e hipertrofia.', icon: 'fitness-outline' },
];

const locationOptions: ChoiceOption<TrainingLocation>[] = [
  {
    value: 'large_gym',
    title: 'Academia grande',
    description: 'Máquinas, cabos, pesos livres e boa variedade.',
    icon: 'business-outline',
  },
  {
    value: 'small_gym',
    title: 'Academia pequena',
    description: 'Pesos livres e equipamentos essenciais.',
    icon: 'barbell-outline',
  },
  { value: 'home_gym', title: 'Treino em casa', description: 'Alguns pesos e equipamentos mínimos.', icon: 'home-outline' },
  { value: 'bodyweight', title: 'Peso corporal', description: 'Sem equipamentos, só exercícios livres.', icon: 'accessibility-outline' },
];

const focusOptions: ChoiceOption<BodyFocus>[] = [
  { value: 'full_body', title: 'Corpo inteiro', icon: 'body-outline' },
  { value: 'shoulders', title: 'Ombros', icon: 'triangle-outline' },
  { value: 'arms', title: 'Braços', icon: 'barbell-outline' },
  { value: 'chest', title: 'Peito', icon: 'shield-outline' },
  { value: 'core', title: 'Abdômen', icon: 'ellipse-outline' },
  { value: 'back', title: 'Costas', icon: 'git-branch-outline' },
  { value: 'glutes', title: 'Glúteos', icon: 'fitness-outline' },
  { value: 'legs', title: 'Pernas', icon: 'walk-outline' },
];

const focusMuscleLabel: Record<BodyFocus, string> = {
  full_body: 'Corpo inteiro',
  shoulders: 'Ombros',
  arms: 'Braços',
  chest: 'Peito',
  core: 'Abdômen',
  back: 'Costas',
  glutes: 'Glúteos',
  legs: 'Pernas',
};

const durationOptions: ChoiceOption<SessionDuration>[] = [
  { value: 'quick', title: 'Rápido', description: 'Até 20 minutos.', icon: 'flash-outline' },
  { value: 'short', title: 'Curto', description: 'De 20 a 40 minutos.', icon: 'timer-outline' },
  { value: 'medium', title: 'Médio', description: 'De 40 a 60 minutos.', icon: 'time-outline' },
  { value: 'long', title: 'Longo', description: '60+ minutos.', icon: 'stopwatch-outline' },
];

const planModeOptions: ChoiceOption<PlanMode>[] = [
  {
    value: 'smart',
    title: 'Plano inteligente',
    description: 'O IronLog ajusta nível e divisão de treino usando seu perfil inicial.',
    icon: 'sparkles-outline',
    badge: 'Recomendado',
  },
  {
    value: 'manual',
    title: 'Plano direto',
    description: 'Comece com a rotina clássica do app e ajuste depois no perfil.',
    icon: 'create-outline',
  },
];

const stepTitles = [
  'Como podemos te chamar?',
  'Qual gênero você se identifica?',
  'Qual é a sua experiência com treino de força?',
  'Com que frequência você treina hoje?',
  'Qual é o seu objetivo atual?',
  'Onde você treina atualmente?',
  'Qual região do corpo você quer focar?',
  'Qual é a sua idade?',
  'Qual é a sua altura?',
  'Qual é o seu peso atual?',
  'Com que frequência você gostaria de treinar?',
  'Qual é o tempo ideal de treino pra você?',
  'Como você deseja configurar seus treinos?',
];

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundNumber(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function inferLevel(form: OnboardingForm): ExperienceLevel {
  if (form.experienciaTreino === 'avancado' && form.frequenciaAtual === 'regularmente') {
    return 'profissional';
  }

  if (form.experienciaTreino === 'intermediario' || form.frequenciaAtual === 'regularmente' || form.diasTreinoSemana >= 5) {
    return 'regular';
  }

  return 'iniciante';
}

function inferWorkoutSplit(form: OnboardingForm): WorkoutSplit {
  if (form.modoPlano === 'manual') {
    return 'normal';
  }

  if (form.diasTreinoSemana <= 3 || form.focoCorpo === 'full_body' || form.localTreino === 'bodyweight') {
    return 'fullBody';
  }

  return 'normal';
}

export function OnboardingFlowScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { draftUser, finishOnboarding } = useUser();
  const [stepIndex, setStepIndex] = useState(0);
  const stepAnimation = useRef(new Animated.Value(1)).current;
  const [form, setForm] = useState<OnboardingForm>({
    nome: draftUser.nome ?? '',
    sobrenome: draftUser.sobrenome ?? '',
    idade: draftUser.idade ?? 20,
    altura: draftUser.altura ?? 175,
    peso: draftUser.peso ?? 70,
    fotoUri: draftUser.fotoUri,
    genero: 'masculino',
    experienciaTreino: 'iniciante',
    frequenciaAtual: 'inconsistente',
    objetivoAtual: 'strength',
    localTreino: 'large_gym',
    focoCorpo: 'full_body',
    metaPeso: draftUser.peso ?? 70,
    diasTreinoSemana: 4,
    duracaoTreino: 'medium',
    modoPlano: 'smart',
  });

  const bmiResult = useMemo(() => calculateBmi(form.peso, form.altura), [form.altura, form.peso]);
  const progress = (stepIndex + 1) / TOTAL_STEPS;
  const canContinue = isStepValid(stepIndex, form);

  useEffect(() => {
    stepAnimation.setValue(0);
    Animated.timing(stepAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [stepAnimation, stepIndex]);

  function setField<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goBack() {
    if (stepIndex === 0) {
      return;
    }

    setStepIndex((current) => current - 1);
  }

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
    const localUri = `${FileSystem.documentDirectory}ironlog-profile-draft-${Date.now()}.${extension}`;

    await FileSystem.copyAsync({ from: pickedUri, to: localUri });
    setField('fotoUri', localUri);
  }

  async function handleNext() {
    if (!canContinue) {
      return;
    }

    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    const nivelAtual = inferLevel(form);
    const workoutSplit = inferWorkoutSplit(form);

    await finishOnboarding({
      ...form,
      nome: form.nome.trim(),
      sobrenome: form.sobrenome.trim(),
      idade: Math.round(form.idade),
      altura: roundNumber(form.altura, 1),
      peso: roundNumber(form.peso, 1),
      metaPeso: roundNumber(form.peso, 1),
      diasTreinoSemana: Math.round(form.diasTreinoSemana),
      nivelAtual,
      workoutSplit,
    });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.shell}>
          <View style={styles.topbar}>
            <Pressable
              accessibilityRole="button"
              disabled={stepIndex === 0}
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.colors.surface,
                  opacity: stepIndex === 0 ? 0.36 : pressed ? 0.74 : 1,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.stepText, { color: theme.colors.text }]}>
              {stepIndex + 1} / {TOTAL_STEPS}
            </Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${progress * 100}%` }]} />
          </View>

          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{
              opacity: stepAnimation,
              transform: [
                {
                  translateY: stepAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.title, { color: theme.colors.text }]}>{stepTitles[stepIndex]}</Text>
            {renderStep({
              stepIndex,
              form,
              bmiResult,
              setField,
              handlePickPhoto,
              colors: theme.colors,
            })}
          </Animated.ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={stepIndex === TOTAL_STEPS - 1 ? 'Começar no IronLog' : 'Próximo'}
              icon={stepIndex === TOTAL_STEPS - 1 ? 'checkmark' : 'arrow-forward'}
              disabled={!canContinue}
              onPress={handleNext}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function isStepValid(stepIndex: number, form: OnboardingForm) {
  if (stepIndex === 0) {
    return form.nome.trim().length >= 2 && form.sobrenome.trim().length >= 2;
  }

  if (stepIndex === 7) {
    return form.idade >= 13 && form.idade <= 90;
  }

  if (stepIndex === 8) {
    return form.altura >= 120 && form.altura <= 230;
  }

  if (stepIndex === 9) {
    return form.peso >= 35 && form.peso <= 250;
  }

  return true;
}

function renderStep({
  stepIndex,
  form,
  bmiResult,
  setField,
  handlePickPhoto,
  colors,
}: {
  stepIndex: number;
  form: OnboardingForm;
  bmiResult: ReturnType<typeof calculateBmi>;
  setField: <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) => void;
  handlePickPhoto: () => void;
  colors: ReturnType<typeof useTheme>['theme']['colors'];
}) {
  switch (stepIndex) {
    case 0:
      return (
        <View style={styles.stepBody}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePickPhoto}
            style={({ pressed }) => [
              styles.photoCard,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
              {form.fotoUri ? (
                <Image source={{ uri: form.fotoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={36} color={colors.primary} />
              )}
              <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={15} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.photoCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {form.fotoUri ? 'Foto definida' : 'Adicionar foto de perfil'}
              </Text>
              <Text style={[styles.cardDescription, { color: colors.textMuted }]}>Opcional, mas deixa o app com a sua cara.</Text>
            </View>
          </Pressable>

          <View style={styles.inputGroup}>
            <ProfileInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} />
            <ProfileInput label="Sobrenome" value={form.sobrenome} onChangeText={(value) => setField('sobrenome', value)} />
          </View>
        </View>
      );

    case 1:
      return <ChoiceList options={genderOptions} value={form.genero} onChange={(value) => setField('genero', value)} />;

    case 2:
      return (
        <ChoiceList
          options={experienceOptions}
          value={form.experienciaTreino}
          onChange={(value) => setField('experienciaTreino', value)}
        />
      );

    case 3:
      return (
        <ChoiceList
          options={currentFrequencyOptions}
          value={form.frequenciaAtual}
          onChange={(value) => setField('frequenciaAtual', value)}
        />
      );

    case 4:
      return <ChoiceList options={goalOptions} value={form.objetivoAtual} onChange={(value) => setField('objetivoAtual', value)} />;

    case 5:
      return <ChoiceList options={locationOptions} value={form.localTreino} onChange={(value) => setField('localTreino', value)} />;

    case 6:
      return (
        <View style={styles.stepBody}>
          <FocusSelectionGrid value={form.focoCorpo} onChange={(value) => setField('focoCorpo', value)} />
          <BodyFocusPreview focus={form.focoCorpo} />
        </View>
      );

    case 7:
      return (
        <NumberSelector
          value={form.idade}
          min={13}
          max={90}
          unit="anos"
          onChange={(value) => setField('idade', value)}
        />
      );

    case 8:
      return (
        <NumberSelector
          value={form.altura}
          min={120}
          max={230}
          unit="cm"
          onChange={(value) => setField('altura', value)}
        />
      );

    case 9:
      return (
        <View style={styles.stepBody}>
          <RulerSelector
            value={form.peso}
            min={35}
            max={250}
            unit="kg"
            step={0.5}
            decimals={1}
            onChange={(value) => setField('peso', value)}
          />
          <BmiSummaryCard bmiResult={bmiResult} />
        </View>
      );

    case 10:
      return (
        <NumberSelector
          value={form.diasTreinoSemana}
          min={1}
          max={7}
          unit="dias por semana"
          onChange={(value) => setField('diasTreinoSemana', value)}
        />
      );

    case 11:
      return <ChoiceList options={durationOptions} value={form.duracaoTreino} onChange={(value) => setField('duracaoTreino', value)} />;

    case 12:
      return (
        <View style={styles.stepBody}>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>Isso pode ser alterado depois no perfil.</Text>
          <ChoiceList options={planModeOptions} value={form.modoPlano} onChange={(value) => setField('modoPlano', value)} />
          <PlanSummary form={form} />
        </View>
      );

    default:
      return null;
  }
}

function ProfileInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.profileInputWrapper}>
      <Text style={[styles.profileInputLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.profileInput,
          {
            backgroundColor: theme.colors.input,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

function ChoiceList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.choiceList}>
      {options.map((option) => (
        <ChoiceCard key={option.value} option={option} selected={option.value === value} onPress={() => onChange(option.value)} />
      ))}
    </View>
  );
}

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.choiceGrid}>
      {options.map((option) => (
        <ChoicePill key={option.value} option={option} selected={option.value === value} onPress={() => onChange(option.value)} />
      ))}
    </View>
  );
}

function ChoiceCard<T extends string>({ option, selected, onPress }: { option: ChoiceOption<T>; selected: boolean; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primarySoft : theme.colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <View style={[styles.choiceIcon, { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : theme.colors.surfaceElevated }]}>
        <Ionicons name={option.icon} size={22} color={selected ? '#FFFFFF' : theme.colors.primary} />
      </View>
      <View style={styles.choiceCopy}>
        <View style={styles.choiceTitleRow}>
          <Text style={[styles.choiceTitle, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{option.title}</Text>
          {option.badge ? (
            <View style={[styles.badge, { backgroundColor: selected ? '#FFFFFF' : theme.colors.primary }]}>
              <Text style={[styles.badgeText, { color: selected ? theme.colors.primary : '#FFFFFF' }]}>{option.badge}</Text>
            </View>
          ) : null}
        </View>
        {option.description ? (
          <Text style={[styles.choiceDescription, { color: selected ? '#EAF4FF' : theme.colors.textMuted }]}>{option.description}</Text>
        ) : null}
      </View>
      <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={22} color={selected ? '#FFFFFF' : theme.colors.primary} />
    </Pressable>
  );
}

function ChoicePill<T extends string>({ option, selected, onPress }: { option: ChoiceOption<T>; selected: boolean; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choicePill,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primarySoft : theme.colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <Ionicons name={option.icon} size={18} color={selected ? '#FFFFFF' : theme.colors.primary} />
      <Text style={[styles.choicePillText, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{option.title}</Text>
    </Pressable>
  );
}

function FocusSelectionGrid({ value, onChange }: { value: BodyFocus; onChange: (value: BodyFocus) => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.focusGrid}>
      {focusOptions.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.focusCard,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                borderColor: selected ? theme.colors.primarySoft : theme.colors.border,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            <MuscleDiagram label={focusMuscleLabel[option.value]} />
            <View style={styles.focusCardCopy}>
              <Text style={[styles.focusCardTitle, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{option.title}</Text>
              <Text style={[styles.focusCardHint, { color: selected ? '#DCEEFF' : theme.colors.textMuted }]}>
                {option.value === 'full_body' ? 'Equilibrado' : 'Prioridade'}
              </Text>
            </View>
            {selected ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function RulerSelector({
  value,
  min,
  max,
  unit,
  step = 1,
  decimals = 0,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  decimals?: number;
  onChange: (value: number) => void;
}) {
  const { theme } = useTheme();
  const tickWidth = 16;
  const dragOffset = useRef(new Animated.Value(0)).current;
  const valueRef = useRef(value);
  const startValue = useRef(value);
  const lastStepValue = useRef(value);
  const onChangeRef = useRef(onChange);
  const isDraggingRef = useRef(false);
  const configRef = useRef({ decimals, max, min, step });
  const [displayValue, setDisplayValue] = useState(value);
  const visibleOffsets = useMemo(() => Array.from({ length: 25 }, (_, index) => index - 12), []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    configRef.current = { decimals, max, min, step };
  }, [decimals, max, min, step]);

  useEffect(() => {
    if (!isDraggingRef.current) {
      valueRef.current = value;
      lastStepValue.current = value;
      setDisplayValue(value);
    }
  }, [value]);

  const settleRuler = () => {
    isDraggingRef.current = false;
    dragOffset.flattenOffset();
    Animated.spring(dragOffset, {
      toValue: 0,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };
  const shouldHandleHorizontalGesture = (_: unknown, gesture: { dx: number; dy: number }) =>
    Math.abs(gesture.dx) > 7 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: shouldHandleHorizontalGesture,
      onMoveShouldSetPanResponderCapture: shouldHandleHorizontalGesture,
      onShouldBlockNativeResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        startValue.current = valueRef.current;
        lastStepValue.current = valueRef.current;
        dragOffset.stopAnimation();
        dragOffset.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        const { decimals: currentDecimals, max: currentMax, min: currentMin, step: currentStep } = configRef.current;
        const movedSteps = Math.round(-gesture.dx / tickWidth);
        const nextValue = roundNumber(
          clampNumber(startValue.current + movedSteps * currentStep, currentMin, currentMax),
          currentDecimals,
        );
        const snappedDx = -movedSteps * tickWidth;
        const residualDx = gesture.dx - snappedDx;

        dragOffset.setValue(residualDx);

        if (nextValue !== lastStepValue.current) {
          lastStepValue.current = nextValue;
          valueRef.current = nextValue;
          setDisplayValue(nextValue);
          onChangeRef.current(nextValue);
        }
      },
      onPanResponderRelease: settleRuler,
      onPanResponderTerminate: settleRuler,
    }),
  ).current;

  return (
    <View style={styles.rulerWrap}>
      <View style={styles.rulerValueRow}>
        <Text style={[styles.rulerValue, { color: theme.colors.text }]}>{formatNumber(displayValue, decimals)}</Text>
        <Text style={[styles.rulerUnit, { color: theme.colors.textMuted }]}>{unit}</Text>
      </View>

      <View
        {...panResponder.panHandlers}
        style={[styles.rulerSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <View pointerEvents="none" style={[styles.rulerFade, styles.rulerFadeLeft, { backgroundColor: theme.colors.surface }]} />
        <View pointerEvents="none" style={[styles.rulerFade, styles.rulerFadeRight, { backgroundColor: theme.colors.surface }]} />
        <View pointerEvents="none" style={[styles.rulerCenterLine, { backgroundColor: theme.colors.primary }]} />
        <Animated.View style={[styles.rulerMovingTicks, { transform: [{ translateX: dragOffset }] }]}>
          {visibleOffsets.map((offset) => {
            const tickValue = roundNumber(displayValue + offset * step, decimals);
            const absoluteStep = Math.round((tickValue - min) / step);
            const isOutOfRange = tickValue < min || tickValue > max;
            const isCenter = offset === 0;
            const isMajor = absoluteStep % 10 === 0;
            const isMedium = absoluteStep % 5 === 0;

            return (
              <View key={offset} style={[styles.rulerTickSlot, { width: tickWidth }]}>
                <View
                  style={[
                    styles.rulerTick,
                    {
                      height: isCenter ? 40 : isMajor ? 30 : isMedium ? 22 : 14,
                      backgroundColor: isCenter ? theme.colors.primary : theme.colors.textMuted,
                      opacity: isOutOfRange ? 0 : isCenter ? 1 : isMajor ? 0.78 : 0.42,
                    },
                  ]}
                />
                {isMajor && !isOutOfRange ? (
                  <Text style={[styles.rulerTickLabel, { color: theme.colors.textMuted }]}>
                    {formatNumber(tickValue, decimals)}
                  </Text>
                ) : (
                  <Text style={styles.rulerTickLabel}> </Text>
                )}
              </View>
            );
          })}
        </Animated.View>
      </View>

      <Text style={[styles.rulerHint, { color: theme.colors.textMuted }]}>Deslize para escolher o peso</Text>
    </View>
  );
}

function NumberSelector({
  value,
  min,
  max,
  unit,
  step = 1,
  decimals = 0,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  decimals?: number;
  onChange: (value: number) => void;
}) {
  const { theme } = useTheme();
  const [input, setInput] = useState(formatNumber(value, decimals));

  useEffect(() => {
    setInput(formatNumber(value, decimals));
  }, [decimals, value]);

  function commit(nextText: string) {
    const parsed = parseMetricValue(nextText);
    const nextValue = clampNumber(parsed || min, min, max);
    onChange(roundNumber(nextValue, decimals));
  }

  function nudge(direction: -1 | 1) {
    const nextValue = clampNumber(value + step * direction, min, max);
    onChange(roundNumber(nextValue, decimals));
  }

  return (
    <View style={styles.numberWrap}>
      <View style={styles.numberControls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => nudge(-1)}
          style={({ pressed }) => [
            styles.roundControl,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="remove" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={styles.numberCenter}>
          <TextInput
            value={input}
            keyboardType="decimal-pad"
            onChangeText={setInput}
            onBlur={() => commit(input)}
            onSubmitEditing={() => commit(input)}
            selectTextOnFocus
            style={[styles.numberInput, { color: theme.colors.text }]}
          />
          <Text style={[styles.numberUnit, { color: theme.colors.textMuted }]}>{unit}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => nudge(1)}
          style={({ pressed }) => [
            styles.roundControl,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="add" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={[styles.rangeTrack, { backgroundColor: theme.colors.surface }]}>
        <View
          style={[
            styles.rangeFill,
            {
              backgroundColor: theme.colors.primary,
              width: `${((clampNumber(value, min, max) - min) / (max - min)) * 100}%`,
            },
          ]}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: theme.colors.textMuted }]}>{formatNumber(min, decimals)}</Text>
        <Text style={[styles.rangeLabel, { color: theme.colors.textMuted }]}>{formatNumber(max, decimals)}</Text>
      </View>
    </View>
  );
}

function formatNumber(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals).replace('.', ',') : String(Math.round(value));
}

function InsightCard({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.insightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.insightIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.insightCopy}>
        <Text style={[styles.insightTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.insightText, { color: theme.colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

function BmiSummaryCard({ bmiResult }: { bmiResult: ReturnType<typeof calculateBmi> }) {
  const { theme } = useTheme();
  const statusColor = getBmiStatusColor(bmiResult?.status, theme.colors.primary);
  const progress = bmiResult ? Math.min(100, Math.max(0, (bmiResult.value / 40) * 100)) : 0;
  const statusTitle = bmiResult ? getBmiStatusTitle(bmiResult.status) : 'IMC indisponível';

  return (
    <View style={[styles.bmiCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.bmiHeader}>
        <View style={[styles.bmiIcon, { backgroundColor: `${statusColor}22` }]}>
          <Ionicons name="body-outline" size={24} color={statusColor} />
        </View>
        <View style={styles.bmiCopy}>
          <Text style={[styles.bmiLabel, { color: theme.colors.textMuted }]}>Índice de massa corporal</Text>
          <Text style={[styles.bmiTitle, { color: theme.colors.text }]}>
            {bmiResult ? `IMC ${bmiResult.value.toLocaleString('pt-BR')} · ${statusTitle}` : 'Confira seus dados'}
          </Text>
        </View>
      </View>

      <View style={[styles.bmiTrack, { backgroundColor: theme.colors.input }]}>
        <View style={[styles.bmiFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
      </View>

      <View style={styles.bmiScale}>
        <Text style={[styles.bmiScaleText, { color: theme.colors.textMuted }]}>18,5</Text>
        <Text style={[styles.bmiScaleText, { color: theme.colors.textMuted }]}>24,9</Text>
        <Text style={[styles.bmiScaleText, { color: theme.colors.textMuted }]}>30+</Text>
      </View>

      <Text style={[styles.bmiDescription, { color: theme.colors.textMuted }]}>
        {bmiResult
          ? `${bmiResult.headline} ${bmiResult.description}`
          : 'Informe altura e peso válidos para calcular seu IMC.'}
      </Text>
    </View>
  );
}

function getBmiStatusColor(status: string | undefined, fallback: string) {
  if (status === 'healthy') {
    return fallback;
  }

  if (status === 'above') {
    return '#F59E0B';
  }

  if (status === 'high') {
    return '#FF5A70';
  }

  return '#7AB7FF';
}

function getBmiStatusTitle(status: string) {
  if (status === 'healthy') {
    return 'bom';
  }

  if (status === 'below') {
    return 'baixo';
  }

  if (status === 'above') {
    return 'atenção';
  }

  return 'alto';
}

function BodyFocusPreview({ focus }: { focus: BodyFocus }) {
  const { theme } = useTheme();
  const label = focusMuscleLabel[focus];

  return (
    <View style={[styles.bodyPreview, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.bodyPreviewMain}>
        <MuscleDiagram label={label} size="large" />
        <View style={styles.bodyPreviewCopy}>
          <Text style={[styles.bodyPreviewEyebrow, { color: theme.colors.primary }]}>Foco escolhido</Text>
          <Text style={[styles.bodyPreviewTitle, { color: theme.colors.text }]}>{label}</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textMuted }]}>
            O plano usa esse foco como prioridade, mantendo equilíbrio e recuperação entre os treinos.
          </Text>
        </View>
      </View>
      <View style={styles.focusStats}>
        <View style={[styles.focusStat, { backgroundColor: theme.colors.input }]}>
          <Ionicons name="flash-outline" size={15} color={theme.colors.primary} />
          <Text style={[styles.focusStatText, { color: theme.colors.text }]}>Prioridade</Text>
        </View>
        <View style={[styles.focusStat, { backgroundColor: theme.colors.input }]}>
          <Ionicons name="sync-outline" size={15} color={theme.colors.primary} />
          <Text style={[styles.focusStatText, { color: theme.colors.text }]}>Equilibrado</Text>
        </View>
      </View>
    </View>
  );
}

function PlanSummary({ form }: { form: OnboardingForm }) {
  const { theme } = useTheme();
  const level = inferLevel(form);
  const split = inferWorkoutSplit(form);
  const levelLabel: Record<ExperienceLevel, string> = {
    iniciante: 'Iniciante',
    regular: 'Regular',
    profissional: 'Profissional',
  };
  const splitLabel: Record<WorkoutSplit, string> = {
    normal: 'Divisão semanal',
    fullBody: 'Full body ABC',
  };

  return (
    <View style={[styles.planSummary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.planSummaryLabel, { color: theme.colors.textMuted }]}>Prévia do plano</Text>
      <Text style={[styles.planSummaryTitle, { color: theme.colors.text }]}>
        {levelLabel[level]} · {splitLabel[split]}
      </Text>
      <Text style={[styles.cardDescription, { color: theme.colors.textMuted }]}>
        {form.diasTreinoSemana} dias por semana, com sessões em ritmo {getDurationLabel(form.duracaoTreino).toLowerCase()}.
      </Text>
    </View>
  );
}

function getDurationLabel(duration: SessionDuration) {
  const labels: Record<SessionDuration, string> = {
    quick: 'rápido',
    short: 'curto',
    medium: 'médio',
    long: 'longo',
  };

  return labels[duration];
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topbar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '900',
  },
  topSpacer: {
    width: 42,
  },
  progressTrack: {
    height: 4,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 24,
    paddingTop: 28,
    paddingBottom: 18,
  },
  title: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '900',
  },
  stepBody: {
    gap: 16,
  },
  footer: {
    paddingTop: 8,
  },
  photoCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  inputGroup: {
    gap: 14,
  },
  profileInputWrapper: {
    gap: 8,
  },
  profileInputLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileInput: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '800',
  },
  choiceList: {
    gap: 12,
  },
  choiceCard: {
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCopy: {
    flex: 1,
    gap: 4,
  },
  choiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  choiceDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    minHeight: 22,
    borderRadius: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choicePill: {
    minHeight: 50,
    minWidth: '47%',
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  choicePillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusCard: {
    width: '48%',
    minHeight: 132,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  focusCardCopy: {
    gap: 3,
  },
  focusCardTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  focusCardHint: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rulerWrap: {
    gap: 18,
    paddingTop: 22,
  },
  rulerValueRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rulerValue: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '300',
  },
  rulerUnit: {
    fontSize: 16,
    fontWeight: '900',
    paddingTop: 20,
  },
  rulerSurface: {
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rulerScrollContent: {
    alignItems: 'center',
  },
  rulerFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 64,
    zIndex: 3,
    opacity: 0.82,
  },
  rulerFadeLeft: {
    left: 0,
  },
  rulerFadeRight: {
    right: 0,
  },
  rulerCenterLine: {
    position: 'absolute',
    left: '50%',
    top: 14,
    bottom: 18,
    width: 4,
    borderRadius: 4,
    marginLeft: -2,
    zIndex: 4,
  },
  rulerMovingTicks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulerTicks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  rulerTickSlot: {
    alignItems: 'center',
    gap: 7,
  },
  rulerTick: {
    width: 2,
    borderRadius: 2,
  },
  rulerTickLabel: {
    minHeight: 13,
    fontSize: 9,
    fontWeight: '800',
  },
  rulerHint: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
  },
  numberWrap: {
    gap: 16,
    paddingTop: 36,
  },
  numberControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  roundControl: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  numberInput: {
    minWidth: 150,
    textAlign: 'center',
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '300',
    paddingVertical: 0,
  },
  numberUnit: {
    fontSize: 15,
    fontWeight: '800',
  },
  rangeTrack: {
    height: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rangeFill: {
    height: '100%',
    borderRadius: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  insightCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  insightText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bmiCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 13,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bmiIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiCopy: {
    flex: 1,
    gap: 3,
  },
  bmiLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bmiTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  bmiTrack: {
    height: 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bmiFill: {
    height: '100%',
    borderRadius: 8,
  },
  bmiScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiScaleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bmiDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  bodyPreview: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  bodyPreviewMain: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  bodyPreviewCopy: {
    flex: 1,
    gap: 5,
  },
  bodyPreviewEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bodyPreviewArt: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  muscleChipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  bodyPreviewTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  focusStats: {
    flexDirection: 'row',
    gap: 8,
  },
  focusStat: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusStatText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  planSummary: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  planSummaryLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  planSummaryTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
});
