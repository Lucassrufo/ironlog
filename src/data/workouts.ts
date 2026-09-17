import { ExperienceLevel, WorkoutExercise, WorkoutPlan, WorkoutSplit } from '../types/models';

export const workoutSplitContent: Record<WorkoutSplit, { title: string; description: string }> = {
  normal: {
    title: 'Treino normal',
    description: 'Rotina tradicional do IronLog, com foco dividido por grupos musculares ao longo da semana.',
  },
  fullBody: {
    title: 'Full body ABC',
    description: 'Treino A, B e C com grupos combinados, pensado para alternar estímulo e recuperação.',
  },
};

function youtubeEmbedSearch(query: string) {
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${query} execução correta musculação`)}`;
}

function youtubeSearch(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} execução correta musculação`)}`;
}

function exercise(
  id: string,
  nome: string,
  grupoMuscular: string,
  suggestedSeries: number,
  suggestedReps: number,
  defaultKg: number,
  icone = 'barbell-outline',
): WorkoutExercise {
  return {
    id,
    nome,
    grupoMuscular,
    icone,
    suggestedSeries,
    suggestedReps,
    defaultKg,
    videoUrl: youtubeEmbedSearch(nome),
    youtubeUrl: youtubeSearch(nome),
    descricao: 'Controle a fase de descida, mantenha a postura estável e ajuste a carga para executar todas as repetições com segurança.',
  };
}

export function getWorkoutPlans(level: ExperienceLevel, split: WorkoutSplit = 'normal') {
  return workoutPlansBySplit[split]?.[level] ?? workoutPlansBySplit.normal[level];
}

export function getWorkoutForDate(level: ExperienceLevel, date: Date, split: WorkoutSplit = 'normal') {
  const plans = getWorkoutPlans(level, split);
  const weekDay = date.getDay();
  const byCalendar = plans.find((plan) => plan.weekDay === weekDay);

  return byCalendar ?? null;
}

export function getWorkoutForToday(level: ExperienceLevel, date = new Date(), split: WorkoutSplit = 'normal') {
  return getWorkoutForDate(level, date, split);
}

export const workoutPlansByLevel: Record<ExperienceLevel, WorkoutPlan[]> = {
  iniciante: [
    {
      id: 'iniciante-a',
      dayLabel: 'Treino A',
      weekDay: 1,
      title: 'Corpo inteiro',
      focus: 'Base de força e adaptação',
      exercises: [
        exercise('ini-supino-maquina', 'Supino máquina', 'Peito', 3, 12, 10),
        exercise('ini-puxada-alta', 'Puxada alta', 'Costas', 3, 12, 15),
        exercise('ini-cadeira-extensora', 'Cadeira extensora', 'Pernas', 3, 12, 15, 'fitness-outline'),
        exercise('ini-elevacao-lateral', 'Elevação lateral', 'Ombro', 2, 12, 4),
        exercise('ini-prancha', 'Prancha', 'Core', 3, 30, 0, 'timer-outline'),
      ],
    },
    {
      id: 'iniciante-b',
      dayLabel: 'Treino B',
      weekDay: 2,
      title: 'Pernas e braços',
      focus: 'Fortalecimento controlado',
      exercises: [
        exercise('ini-ter-leg-press', 'Leg press', 'Pernas', 3, 12, 40, 'fitness-outline'),
        exercise('ini-ter-mesa-flexora', 'Mesa flexora', 'Posterior', 3, 12, 15),
        exercise('ini-ter-remada-baixa', 'Remada baixa', 'Costas', 3, 12, 15),
        exercise('ini-ter-rosca-martelo', 'Rosca martelo', 'Bíceps', 2, 12, 5),
        exercise('ini-ter-triceps-corda', 'Tríceps corda', 'Tríceps', 2, 12, 10),
      ],
    },
    {
      id: 'iniciante-c',
      dayLabel: 'Treino C',
      weekDay: 3,
      title: 'Cardio e mobilidade',
      focus: 'Condicionamento leve',
      exercises: [
        exercise('ini-qua-cardio', 'Cárdio moderado', 'Cardio', 1, 20, 0, 'heart-outline'),
        exercise('ini-qua-abdutora', 'Cadeira abdutora', 'Pernas', 2, 15, 15, 'fitness-outline'),
        exercise('ini-qua-panturrilha', 'Elevação de gêmeos sentado', 'Panturrilha', 3, 15, 10),
        exercise('ini-qua-abdominal', 'Abdominal máquina', 'Core', 3, 15, 10, 'timer-outline'),
      ],
    },
    {
      id: 'iniciante-d',
      dayLabel: 'Treino A',
      weekDay: 4,
      title: 'Corpo inteiro',
      focus: 'Base de força e adaptação',
      exercises: [
        exercise('ini-qui-supino-maquina', 'Supino máquina', 'Peito', 3, 12, 10),
        exercise('ini-qui-puxada-alta', 'Puxada alta', 'Costas', 3, 12, 15),
        exercise('ini-qui-cadeira-extensora', 'Cadeira extensora', 'Pernas', 3, 12, 15, 'fitness-outline'),
        exercise('ini-qui-elevacao-lateral', 'Elevação lateral', 'Ombro', 2, 12, 4),
        exercise('ini-qui-prancha', 'Prancha', 'Core', 3, 30, 0, 'timer-outline'),
      ],
    },
    {
      id: 'iniciante-e',
      dayLabel: 'Treino B',
      weekDay: 5,
      title: 'Pernas e braços',
      focus: 'Fortalecimento controlado',
      exercises: [
        exercise('ini-sex-leg-press', 'Leg press', 'Pernas', 3, 12, 40, 'fitness-outline'),
        exercise('ini-sex-mesa-flexora', 'Mesa flexora', 'Posterior', 3, 12, 15),
        exercise('ini-sex-remada-baixa', 'Remada baixa', 'Costas', 3, 12, 15),
        exercise('ini-sex-rosca-martelo', 'Rosca martelo', 'Bíceps', 2, 12, 5),
        exercise('ini-sex-triceps-corda', 'Tríceps corda', 'Tríceps', 2, 12, 10),
      ],
    },
    {
      id: 'iniciante-cardio',
      dayLabel: 'Treino C',
      weekDay: 6,
      title: 'Cardio e mobilidade',
      focus: 'Condicionamento leve',
      exercises: [
        exercise('ini-cardio', 'Cárdio moderado', 'Cardio', 1, 20, 0, 'heart-outline'),
        exercise('ini-abdutora', 'Cadeira abdutora', 'Pernas', 2, 15, 15, 'fitness-outline'),
        exercise('ini-panturrilha', 'Elevação de gêmeos sentado', 'Panturrilha', 3, 15, 10),
        exercise('ini-abdominal', 'Abdominal máquina', 'Core', 3, 15, 10, 'timer-outline'),
      ],
    },
  ],
  regular: [
    {
      id: 'regular-segunda',
      dayLabel: 'Segunda',
      weekDay: 1,
      title: 'Peito, tríceps e ombro',
      focus: 'Empurrar',
      exercises: [
        exercise('reg-supino-reto', 'Supino reto', 'Peito', 4, 10, 30),
        exercise('reg-supino-inclinado', 'Supino inclinado', 'Peito', 4, 10, 28),
        exercise('reg-crucifixo', 'Crucifixo', 'Peito', 3, 12, 12),
        exercise('reg-elevacao-lateral', 'Elevação lateral (halter)', 'Ombro', 3, 12, 6),
        exercise('reg-elevacao-frontal', 'Elevação frontal', 'Ombro', 3, 12, 6),
        exercise('reg-triceps-pulley', 'Tríceps pulley (barra W)', 'Tríceps', 3, 12, 20),
        exercise('reg-triceps-corda', 'Tríceps corda', 'Tríceps', 3, 12, 18),
        exercise('reg-triceps-testa', 'Tríceps testa', 'Tríceps', 3, 10, 16),
      ],
    },
    {
      id: 'regular-terca',
      dayLabel: 'Terça',
      weekDay: 2,
      title: 'Costas e bíceps',
      focus: 'Puxar',
      exercises: [
        exercise('reg-rosca-martelo', 'Rosca martelo', 'Bíceps', 3, 12, 10),
        exercise('reg-rosca-scott', 'Rosca Scott máquina', 'Bíceps', 3, 10, 20),
        exercise('reg-rosca-45', 'Rosca 45', 'Bíceps', 3, 10, 8),
        exercise('reg-puxada-alta', 'Puxada alta', 'Costas', 4, 10, 35),
        exercise('reg-remada-baixa', 'Remada baixa', 'Costas', 4, 10, 35),
        exercise('reg-remada-curvada-maquina', 'Remada curvada máquina', 'Costas', 3, 10, 30),
        exercise('reg-serrote', 'Serrote', 'Costas', 3, 12, 16),
      ],
    },
    {
      id: 'regular-quarta',
      dayLabel: 'Quarta',
      weekDay: 3,
      title: 'Perna',
      focus: 'Quadríceps, posterior e panturrilha',
      exercises: [
        exercise('reg-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 4, 12, 30, 'fitness-outline'),
        exercise('reg-hack-aberto', 'Agachamento aberto no hack', 'Pernas', 4, 10, 50, 'fitness-outline'),
        exercise('reg-leg-press-aberto', 'Leg press aberto', 'Pernas', 4, 12, 90, 'fitness-outline'),
        exercise('reg-leg-press-sentado', 'Leg press sentado', 'Pernas', 4, 12, 70, 'fitness-outline'),
        exercise('reg-mesa-flexora', 'Mesa flexora', 'Posterior', 4, 12, 30),
        exercise('reg-cadeira-abdutora', 'Cadeira abdutora', 'Glúteos', 3, 15, 35),
        exercise('reg-gemeos-sentado', 'Elevação de gêmeos sentado', 'Panturrilha', 4, 15, 30),
      ],
    },
    {
      id: 'regular-quinta',
      dayLabel: 'Quinta',
      weekDay: 4,
      title: 'Peito, tríceps e ombro',
      focus: 'Empurrar reduzido',
      exercises: [
        exercise('reg2-supino-reto', 'Supino reto', 'Peito', 4, 10, 30),
        exercise('reg2-supino-inclinado', 'Supino inclinado', 'Peito', 4, 10, 28),
        exercise('reg2-crucifixo', 'Crucifixo', 'Peito', 3, 12, 12),
        exercise('reg2-elevacao-lateral', 'Elevação lateral (halter)', 'Ombro', 3, 12, 6),
        exercise('reg2-triceps-pulley', 'Tríceps pulley (barra W)', 'Tríceps', 3, 12, 20),
        exercise('reg2-triceps-corda', 'Tríceps corda', 'Tríceps', 3, 12, 18),
      ],
    },
    {
      id: 'regular-sexta',
      dayLabel: 'Sexta',
      weekDay: 5,
      title: 'Costas e bíceps',
      focus: 'Puxar',
      exercises: [
        exercise('reg2-rosca-martelo', 'Rosca martelo', 'Bíceps', 3, 12, 10),
        exercise('reg2-rosca-scott', 'Rosca Scott máquina', 'Bíceps', 3, 10, 20),
        exercise('reg2-rosca-45', 'Rosca 45', 'Bíceps', 3, 10, 8),
        exercise('reg2-puxada-alta', 'Puxada alta', 'Costas', 4, 10, 35),
        exercise('reg2-remada-baixa', 'Remada baixa', 'Costas', 4, 10, 35),
        exercise('reg2-remada-curvada-maquina', 'Remada curvada máquina', 'Costas', 3, 10, 30),
        exercise('reg2-serrote', 'Serrote', 'Costas', 3, 12, 16),
      ],
    },
    {
      id: 'regular-sabado',
      dayLabel: 'Sábado',
      weekDay: 6,
      title: 'Cárdio',
      focus: 'Condicionamento',
      exercises: [exercise('reg-cardio', 'Cárdio', 'Cardio', 1, 30, 0, 'heart-outline')],
    },
  ],
  profissional: [
    {
      id: 'pro-peito-panturrilha',
      dayLabel: 'Dia 1',
      weekDay: 1,
      title: 'Peito e panturrilhas',
      focus: 'Volume alto',
      exercises: [
        exercise('pro-crucifixo-reto', 'Crucifixo reto máquina ou cabo', 'Peito', 3, 15, 18),
        exercise('pro-supino-inclinado-halteres', 'Supino inclinado com halteres', 'Peito', 4, 10, 32),
        exercise('pro-supino-maquina', 'Supino máquina inclinado', 'Peito', 4, 10, 45),
        exercise('pro-supino-reto', 'Supino reto barra guiada', 'Peito', 4, 10, 55),
        exercise('pro-cross-over', 'Cross over', 'Peito', 4, 15, 22),
        exercise('pro-paralela', 'Paralela', 'Peito e tríceps', 4, 8, 0),
        exercise('pro-panturrilha', 'Panturrilha máquina', 'Panturrilha', 6, 20, 45),
      ],
    },
    {
      id: 'pro-costas',
      dayLabel: 'Dia 2',
      weekDay: 2,
      title: 'Costas',
      focus: 'Densidade e largura',
      exercises: [
        exercise('pro-remada-curvada-barra', 'Remada curvada com barra', 'Costas', 5, 10, 55),
        exercise('pro-remada-halteres', 'Remada com halteres', 'Costas', 3, 12, 28),
        exercise('pro-puxador-frente', 'Puxador frente', 'Costas', 5, 12, 50),
        exercise('pro-remada-maquina', 'Remada máquina', 'Costas', 3, 12, 45),
        exercise('pro-remada-baixa-cabo', 'Remada baixa cabo', 'Costas', 3, 12, 45),
        exercise('pro-pullover', 'Pullover', 'Costas', 5, 15, 25),
      ],
    },
    {
      id: 'pro-perna',
      dayLabel: 'Dia 3',
      weekDay: 3,
      title: 'Perna completa',
      focus: 'Quadríceps, posterior e panturrilhas',
      exercises: [
        exercise('pro-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 4, 20, 40),
        exercise('pro-agachamento', 'Agachamento', 'Pernas', 4, 10, 70),
        exercise('pro-leg-press', 'Leg press', 'Pernas', 4, 15, 140),
        exercise('pro-flexora-deitada', 'Cadeira flexora deitada', 'Posterior', 3, 15, 40),
        exercise('pro-flexora-sentada', 'Cadeira flexora sentada', 'Posterior', 3, 12, 40),
        exercise('pro-stiff', 'Leg stiff', 'Posterior', 3, 12, 50),
        exercise('pro-panturrilha-perna', 'Panturrilha máquina', 'Panturrilha', 6, 20, 50),
      ],
    },
    {
      id: 'pro-ombros',
      dayLabel: 'Dia 4',
      weekDay: 4,
      title: 'Ombros e panturrilhas',
      focus: 'Deltoides completos',
      exercises: [
        exercise('pro-elevacao-lateral-cabo', 'Elevação lateral com cabo', 'Ombro', 3, 15, 10),
        exercise('pro-elevacao-lateral-halteres', 'Elevação lateral com halteres', 'Ombro', 3, 15, 9),
        exercise('pro-desenvolvimento-maquina', 'Desenvolvimento na máquina', 'Ombro', 5, 10, 45),
        exercise('pro-elevacao-lateral-maquina', 'Elevação lateral na máquina', 'Ombro', 3, 15, 25),
        exercise('pro-elevacao-frontal', 'Elevação frontal com halteres', 'Ombro', 3, 12, 10),
        exercise('pro-crucifixo-invertido', 'Crucifixo invertido', 'Posterior de ombro', 5, 12, 20),
        exercise('pro-panturrilha-ombro', 'Panturrilha máquina', 'Panturrilha', 6, 20, 50),
      ],
    },
    {
      id: 'pro-bracos',
      dayLabel: 'Dia 5',
      weekDay: 5,
      title: 'Braços',
      focus: 'Bíceps e tríceps',
      exercises: [
        exercise('pro-rosca-direta-cabo', 'Rosca direta no cabo', 'Bíceps', 4, 12, 25),
        exercise('pro-rosca-direta-halteres', 'Rosca direta com halteres', 'Bíceps', 4, 10, 14),
        exercise('pro-rosca-scott', 'Rosca Scott', 'Bíceps', 4, 10, 25),
        exercise('pro-triceps-cabo', 'Extensão tríceps no cabo', 'Tríceps', 4, 15, 25),
        exercise('pro-triceps-maquina', 'Extensão tríceps na máquina', 'Tríceps', 4, 15, 35),
        exercise('pro-paralela-maquina', 'Paralela na máquina', 'Tríceps', 4, 12, 45),
      ],
    },
  ],
};

const fullBodyWorkoutPlansByLevel: Record<ExperienceLevel, WorkoutPlan[]> = {
  iniciante: [
    {
      id: 'iniciante-abc-a',
      dayLabel: 'Dia A',
      weekDay: 1,
      title: 'Dia A: Peito, ombros e tríceps',
      focus: 'Base superior com máquinas e carga controlada',
      exercises: [
        exercise('ini-abc-a-supino-maquina', 'Supino máquina', 'Peito', 2, 12, 10),
        exercise('ini-abc-a-supino-inclinado', 'Supino inclinado com halteres', 'Peito', 2, 12, 6),
        exercise('ini-abc-a-crucifixo-maquina', 'Crucifixo máquina', 'Peito', 2, 12, 8),
        exercise('ini-abc-a-desenvolvimento-maquina', 'Desenvolvimento de ombros máquina', 'Ombros', 2, 12, 8),
        exercise('ini-abc-a-elevacao-lateral', 'Elevação lateral com halteres', 'Ombros', 2, 12, 3),
        exercise('ini-abc-a-triceps-corda', 'Tríceps corda', 'Tríceps', 2, 12, 8),
      ],
    },
    {
      id: 'iniciante-abc-b',
      dayLabel: 'Dia B',
      weekDay: 3,
      title: 'Dia B: Costas, bíceps e trapézio',
      focus: 'Puxadas e remadas com execução estável',
      exercises: [
        exercise('ini-abc-b-puxada-frontal', 'Puxada frontal no pulley', 'Costas', 2, 12, 15),
        exercise('ini-abc-b-remada-baixa', 'Remada baixa', 'Costas', 2, 12, 15),
        exercise('ini-abc-b-remada-unilateral', 'Remada unilateral com halter', 'Costas', 2, 12, 6),
        exercise('ini-abc-b-crucifixo-invertido', 'Crucifixo invertido máquina', 'Posterior de ombro', 2, 12, 8),
        exercise('ini-abc-b-rosca-direta', 'Rosca direta na polia', 'Bíceps', 2, 12, 8),
        exercise('ini-abc-b-rosca-alternada', 'Rosca alternada com halteres', 'Bíceps', 2, 12, 5),
      ],
    },
    {
      id: 'iniciante-abc-c',
      dayLabel: 'Dia C',
      weekDay: 5,
      title: 'Dia C: Pernas e abdômen',
      focus: 'Movimentos básicos e core',
      exercises: [
        exercise('ini-abc-c-leg-press', 'Leg press 45º', 'Pernas', 3, 12, 35, 'fitness-outline'),
        exercise('ini-abc-c-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 2, 12, 15, 'fitness-outline'),
        exercise('ini-abc-c-agachamento-goblet', 'Agachamento goblet', 'Pernas', 2, 10, 6, 'fitness-outline'),
        exercise('ini-abc-c-cadeira-flexora', 'Cadeira flexora', 'Posterior', 2, 12, 15),
        exercise('ini-abc-c-stiff-halteres', 'Stiff com halteres', 'Posterior', 2, 10, 8),
        exercise('ini-abc-c-panturrilha', 'Panturrilha em pé máquina', 'Panturrilha', 3, 15, 20),
        exercise('ini-abc-c-abdominal', 'Abdominal supra', 'Core', 2, 15, 0, 'timer-outline'),
        exercise('ini-abc-c-prancha', 'Prancha isométrica', 'Core', 2, 30, 0, 'timer-outline'),
      ],
    },
  ],
  regular: [
    {
      id: 'regular-abc-a',
      dayLabel: 'Dia A',
      weekDay: 1,
      title: 'Dia A: Peito, ombros e tríceps',
      focus: 'Empurrar com volume moderado',
      exercises: [
        exercise('reg-abc-a-supino-reto', 'Supino reto com barra ou halteres', 'Peito', 3, 10, 30),
        exercise('reg-abc-a-supino-inclinado', 'Supino inclinado com halteres', 'Peito', 3, 12, 28),
        exercise('reg-abc-a-crucifixo-polia', 'Crucifixo na polia (fly)', 'Peito', 3, 12, 12),
        exercise('reg-abc-a-desenvolvimento', 'Desenvolvimento de ombros', 'Ombros', 3, 12, 18),
        exercise('reg-abc-a-elevacao-lateral', 'Elevação lateral com halteres', 'Ombros', 4, 15, 6),
        exercise('reg-abc-a-triceps-corda', 'Tríceps na polia (corda)', 'Tríceps', 3, 12, 18),
        exercise('reg-abc-a-triceps-testa', 'Tríceps testa', 'Tríceps', 3, 10, 16),
      ],
    },
    {
      id: 'regular-abc-b',
      dayLabel: 'Dia B',
      weekDay: 3,
      title: 'Dia B: Costas, bíceps e trapézio',
      focus: 'Puxar com remadas e controle escapular',
      exercises: [
        exercise('reg-abc-b-puxada-frontal', 'Puxada frontal (pulley)', 'Costas', 3, 12, 35),
        exercise('reg-abc-b-remada-baixa', 'Remada baixa', 'Costas', 3, 10, 35),
        exercise('reg-abc-b-serrote', 'Remada serrote unilateral', 'Costas', 3, 12, 16),
        exercise('reg-abc-b-crucifixo-invertido', 'Crucifixo invertido', 'Posterior de ombro', 3, 15, 12),
        exercise('reg-abc-b-rosca-direta', 'Rosca direta', 'Bíceps', 3, 12, 20),
        exercise('reg-abc-b-rosca-alternada', 'Rosca alternada', 'Bíceps', 3, 10, 10),
      ],
    },
    {
      id: 'regular-abc-c',
      dayLabel: 'Dia C',
      weekDay: 5,
      title: 'Dia C: Pernas e abdômen',
      focus: 'Pernas completas e estabilidade do core',
      exercises: [
        exercise('reg-abc-c-leg-press', 'Leg press 45º', 'Pernas', 4, 12, 90, 'fitness-outline'),
        exercise('reg-abc-c-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 3, 15, 30, 'fitness-outline'),
        exercise('reg-abc-c-agachamento', 'Agachamento livre ou barra guiada', 'Pernas', 3, 10, 50, 'fitness-outline'),
        exercise('reg-abc-c-cadeira-flexora', 'Cadeira flexora', 'Posterior', 3, 12, 30),
        exercise('reg-abc-c-stiff', 'Stiff ou levantamento terra', 'Posterior', 3, 10, 45),
        exercise('reg-abc-c-panturrilha', 'Panturrilha em pé máquina', 'Panturrilha', 4, 15, 35),
        exercise('reg-abc-c-abdominal', 'Abdominal supra', 'Core', 3, 20, 0, 'timer-outline'),
        exercise('reg-abc-c-prancha', 'Prancha isométrica', 'Core', 3, 45, 0, 'timer-outline'),
      ],
    },
  ],
  profissional: [
    {
      id: 'profissional-abc-a1',
      dayLabel: 'Dia A',
      weekDay: 1,
      title: 'Dia A: Peito, ombros e tríceps',
      focus: 'Força e hipertrofia em empurrar',
      exercises: [
        exercise('pro-abc-a1-supino-reto', 'Supino reto com barra', 'Peito', 4, 8, 60),
        exercise('pro-abc-a1-supino-inclinado', 'Supino inclinado com halteres', 'Peito', 4, 10, 34),
        exercise('pro-abc-a1-paralela', 'Paralelas ou mergulho máquina', 'Peito e tríceps', 3, 8, 0),
        exercise('pro-abc-a1-crucifixo-polia', 'Crucifixo na polia alta', 'Peito', 3, 12, 24),
        exercise('pro-abc-a1-desenvolvimento', 'Desenvolvimento militar ou máquina', 'Ombros', 4, 8, 50),
        exercise('pro-abc-a1-elevacao-lateral', 'Elevação lateral no cabo', 'Ombros', 4, 15, 12),
        exercise('pro-abc-a1-triceps-testa', 'Tríceps testa barra W', 'Tríceps', 3, 10, 22),
        exercise('pro-abc-a1-triceps-corda', 'Tríceps corda', 'Tríceps', 3, 12, 24),
      ],
    },
    {
      id: 'profissional-abc-b1',
      dayLabel: 'Dia B',
      weekDay: 2,
      title: 'Dia B: Costas, bíceps e trapézio',
      focus: 'Densidade de costas e puxadas pesadas',
      exercises: [
        exercise('pro-abc-b1-barra-fixa', 'Barra fixa ou puxada frontal', 'Costas', 4, 8, 55),
        exercise('pro-abc-b1-remada-curvada', 'Remada curvada com barra', 'Costas', 4, 8, 60),
        exercise('pro-abc-b1-remada-baixa', 'Remada baixa aberta', 'Costas', 4, 10, 50),
        exercise('pro-abc-b1-remada-unilateral', 'Remada unilateral com halter', 'Costas', 3, 10, 30),
        exercise('pro-abc-b1-face-pull', 'Face pull ou crucifixo invertido', 'Posterior de ombro', 3, 15, 18),
        exercise('pro-abc-b1-encolhimento', 'Encolhimento com halteres', 'Trapézio', 4, 12, 32),
        exercise('pro-abc-b1-rosca-direta', 'Rosca direta com barra', 'Bíceps', 4, 10, 28),
        exercise('pro-abc-b1-rosca-inclinada', 'Rosca alternada no banco inclinado', 'Bíceps', 3, 10, 14),
      ],
    },
    {
      id: 'profissional-abc-c1',
      dayLabel: 'Dia C',
      weekDay: 3,
      title: 'Dia C: Pernas e abdômen',
      focus: 'Pernas pesadas, posterior e core',
      exercises: [
        exercise('pro-abc-c1-agachamento', 'Agachamento livre', 'Pernas', 4, 8, 80, 'fitness-outline'),
        exercise('pro-abc-c1-leg-press', 'Leg press 45º', 'Pernas', 4, 10, 160, 'fitness-outline'),
        exercise('pro-abc-c1-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 4, 12, 50, 'fitness-outline'),
        exercise('pro-abc-c1-stiff', 'Stiff com barra', 'Posterior', 4, 8, 70),
        exercise('pro-abc-c1-mesa-flexora', 'Mesa flexora', 'Posterior', 3, 12, 45),
        exercise('pro-abc-c1-panturrilha', 'Panturrilha em pé máquina', 'Panturrilha', 5, 15, 60),
        exercise('pro-abc-c1-elevacao-pernas', 'Elevação de pernas', 'Core', 3, 15, 0, 'timer-outline'),
        exercise('pro-abc-c1-prancha-carga', 'Prancha com carga', 'Core', 3, 60, 10, 'timer-outline'),
      ],
    },
    {
      id: 'profissional-abc-a2',
      dayLabel: 'Dia A',
      weekDay: 4,
      title: 'Dia A: Peito, ombros e tríceps',
      focus: 'Segunda rodada de empurrar na semana',
      exercises: [
        exercise('pro-abc-a2-supino-reto', 'Supino reto com barra', 'Peito', 4, 8, 60),
        exercise('pro-abc-a2-supino-inclinado', 'Supino inclinado com halteres', 'Peito', 4, 10, 34),
        exercise('pro-abc-a2-paralela', 'Paralelas ou mergulho máquina', 'Peito e tríceps', 3, 8, 0),
        exercise('pro-abc-a2-crucifixo-polia', 'Crucifixo na polia alta', 'Peito', 3, 12, 24),
        exercise('pro-abc-a2-desenvolvimento', 'Desenvolvimento militar ou máquina', 'Ombros', 4, 8, 50),
        exercise('pro-abc-a2-elevacao-lateral', 'Elevação lateral no cabo', 'Ombros', 4, 15, 12),
        exercise('pro-abc-a2-triceps-testa', 'Tríceps testa barra W', 'Tríceps', 3, 10, 22),
        exercise('pro-abc-a2-triceps-corda', 'Tríceps corda', 'Tríceps', 3, 12, 24),
      ],
    },
    {
      id: 'profissional-abc-b2',
      dayLabel: 'Dia B',
      weekDay: 5,
      title: 'Dia B: Costas, bíceps e trapézio',
      focus: 'Segunda rodada de puxar na semana',
      exercises: [
        exercise('pro-abc-b2-barra-fixa', 'Barra fixa ou puxada frontal', 'Costas', 4, 8, 55),
        exercise('pro-abc-b2-remada-curvada', 'Remada curvada com barra', 'Costas', 4, 8, 60),
        exercise('pro-abc-b2-remada-baixa', 'Remada baixa aberta', 'Costas', 4, 10, 50),
        exercise('pro-abc-b2-remada-unilateral', 'Remada unilateral com halter', 'Costas', 3, 10, 30),
        exercise('pro-abc-b2-face-pull', 'Face pull ou crucifixo invertido', 'Posterior de ombro', 3, 15, 18),
        exercise('pro-abc-b2-encolhimento', 'Encolhimento com halteres', 'Trapézio', 4, 12, 32),
        exercise('pro-abc-b2-rosca-direta', 'Rosca direta com barra', 'Bíceps', 4, 10, 28),
        exercise('pro-abc-b2-rosca-inclinada', 'Rosca alternada no banco inclinado', 'Bíceps', 3, 10, 14),
      ],
    },
    {
      id: 'profissional-abc-c2',
      dayLabel: 'Dia C',
      weekDay: 6,
      title: 'Dia C: Pernas e abdômen',
      focus: 'Segunda rodada de pernas e core na semana',
      exercises: [
        exercise('pro-abc-c2-agachamento', 'Agachamento livre', 'Pernas', 4, 8, 80, 'fitness-outline'),
        exercise('pro-abc-c2-leg-press', 'Leg press 45º', 'Pernas', 4, 10, 160, 'fitness-outline'),
        exercise('pro-abc-c2-cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 4, 12, 50, 'fitness-outline'),
        exercise('pro-abc-c2-stiff', 'Stiff com barra', 'Posterior', 4, 8, 70),
        exercise('pro-abc-c2-mesa-flexora', 'Mesa flexora', 'Posterior', 3, 12, 45),
        exercise('pro-abc-c2-panturrilha', 'Panturrilha em pé máquina', 'Panturrilha', 5, 15, 60),
        exercise('pro-abc-c2-elevacao-pernas', 'Elevação de pernas', 'Core', 3, 15, 0, 'timer-outline'),
        exercise('pro-abc-c2-prancha-carga', 'Prancha com carga', 'Core', 3, 60, 10, 'timer-outline'),
      ],
    },
  ],
};

function buildAbcWeeklyCalendar(plans: WorkoutPlan[]) {
  const weekCycle = [0, 1, 2, 0, 1, 2];

  return weekCycle.map((planIndex, index) => {
    const plan = plans[planIndex];

    return {
      ...plan,
      id: `${plan.id}-dia-${index + 1}`,
      weekDay: index + 1,
    };
  });
}

export const workoutPlansBySplit: Record<WorkoutSplit, Record<ExperienceLevel, WorkoutPlan[]>> = {
  normal: workoutPlansByLevel,
  fullBody: {
    iniciante: buildAbcWeeklyCalendar(fullBodyWorkoutPlansByLevel.iniciante),
    regular: buildAbcWeeklyCalendar(fullBodyWorkoutPlansByLevel.regular),
    profissional: fullBodyWorkoutPlansByLevel.profissional,
  },
};
