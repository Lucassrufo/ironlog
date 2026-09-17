import { WorkoutExercise } from '../types/models';

const muscleAliases: Record<string, string> = {
  core: 'Abdômen',
  abdominal: 'Abdômen',
  peito: 'Peito',
  costas: 'Costas',
  ombro: 'Ombros',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  bíceps: 'Bíceps',
  triceps: 'Tríceps',
  tríceps: 'Tríceps',
  quadriceps: 'Quadríceps',
  quadríceps: 'Quadríceps',
  pernas: 'Pernas',
  posterior: 'Posterior',
  gluteos: 'Glúteos',
  glúteos: 'Glúteos',
  panturrilha: 'Panturrilha',
  cardio: 'Cardio',
};

export const muscleLibrary = [
  { label: 'Peito', count: 36, highlights: ['chest'] },
  { label: 'Costas', count: 38, highlights: ['back'] },
  { label: 'Ombros', count: 43, highlights: ['shoulders'] },
  { label: 'Bíceps', count: 26, highlights: ['arms'] },
  { label: 'Tríceps', count: 26, highlights: ['arms'] },
  { label: 'Quadríceps', count: 40, highlights: ['legs'] },
  { label: 'Pernas', count: 45, highlights: ['legs'] },
  { label: 'Abdômen', count: 30, highlights: ['core'] },
];

export function normalizeMuscleName(group: string) {
  const normalized = group
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return muscleAliases[normalized] ?? group;
}

export function getTargetMuscles(exercises: WorkoutExercise[], maxItems = 3) {
  const unique = Array.from(new Set(exercises.map((exercise) => normalizeMuscleName(exercise.grupoMuscular))));
  return unique.slice(0, maxItems);
}

export function getMuscleHighlights(label: string) {
  const normalized = normalizeMuscleName(label).toLowerCase();

  if (normalized.includes('peito')) {
    return ['chest'];
  }

  if (normalized.includes('costas')) {
    return ['back'];
  }

  if (normalized.includes('ombro')) {
    return ['shoulders'];
  }

  if (normalized.includes('bíceps') || normalized.includes('tríceps') || normalized.includes('braco')) {
    return ['arms'];
  }

  if (normalized.includes('abd')) {
    return ['core'];
  }

  if (normalized.includes('glúte')) {
    return ['glutes'];
  }

  if (normalized.includes('perna') || normalized.includes('quadr') || normalized.includes('posterior') || normalized.includes('panturrilha')) {
    return ['legs'];
  }

  return ['full'];
}

export function getExerciseEquipment(exerciseName: string) {
  const name = exerciseName.toLowerCase();

  if (name.includes('halter')) {
    return 'Halteres';
  }

  if (name.includes('barra')) {
    return 'Barra olímpica';
  }

  if (name.includes('cabo') || name.includes('polia') || name.includes('pulley') || name.includes('corda')) {
    return 'Cabos e polia';
  }

  if (name.includes('máquina') || name.includes('maquina') || name.includes('cadeira') || name.includes('mesa') || name.includes('leg press')) {
    return 'Máquina de musculação';
  }

  if (name.includes('cardio') || name.includes('cárdio')) {
    return 'Esteira ou bike';
  }

  if (name.includes('prancha') || name.includes('abdominal')) {
    return 'Peso corporal';
  }

  return 'Equipamento livre';
}

export function getExerciseInstructions(exercise: WorkoutExercise) {
  const muscle = normalizeMuscleName(exercise.grupoMuscular).toLowerCase();

  if (muscle.includes('peito')) {
    return [
      'Ajuste o banco e mantenha os pés firmes no chão.',
      'Posicione as mãos de forma simétrica e trave as escápulas.',
      'Desça a carga com controle até sentir alongar o peitoral.',
      'Empurre sem perder o alinhamento dos ombros.',
    ];
  }

  if (muscle.includes('costas')) {
    return [
      'Mantenha o tronco estável antes de iniciar a puxada.',
      'Puxe com os cotovelos, sem encolher os ombros.',
      'Segure um instante no ponto de contração.',
      'Volte controlando a carga e sem arredondar a coluna.',
    ];
  }

  if (muscle.includes('perna') || muscle.includes('quadr') || muscle.includes('posterior')) {
    return [
      'Apoie os pés com firmeza e alinhe joelhos e quadril.',
      'Desça com controle, mantendo a coluna estável.',
      'Empurre o chão ou a plataforma sem travar os joelhos.',
      'Mantenha o ritmo constante em todas as repetições.',
    ];
  }

  if (muscle.includes('bíceps') || muscle.includes('tríceps') || muscle.includes('ombro')) {
    return [
      'Comece com postura alta e abdômen firme.',
      'Movimente apenas a articulação principal do exercício.',
      'Controle a volta da carga sem embalar o corpo.',
      'Pare a série se perder amplitude ou técnica.',
    ];
  }

  return [
    'Organize a postura antes da primeira repetição.',
    'Execute o movimento com controle e respiração estável.',
    'Use uma carga que permita completar todas as séries.',
    'Priorize técnica antes de aumentar intensidade.',
  ];
}
