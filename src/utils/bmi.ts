export type BmiStatus = 'below' | 'healthy' | 'above' | 'high';
export type WeightGoalDirection = 'lose' | 'gain' | 'maintain';

export interface BmiResult {
  value: number;
  label: string;
  status: BmiStatus;
  headline: string;
  description: string;
}

export interface WeightGoalProjection {
  direction: WeightGoalDirection;
  amountKg: number;
  percentChange: number;
  weeklyRateKg: number;
  weeks: number;
  days: number;
  targetDate: Date;
  title: string;
  description: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const value = roundTo(weightKg / (heightM * heightM), 1);

  if (value < 18.5) {
    return {
      value,
      label: 'Abaixo do indicado',
      status: 'below',
      headline: 'Seu IMC ficou abaixo da faixa indicada.',
      description: 'Use esse resultado como um sinal para acompanhar peso, alimentação e evolução com atenção.',
    };
  }

  if (value < 25) {
    return {
      value,
      label: 'Dentro do indicado',
      status: 'healthy',
      headline: 'Seu IMC está dentro da faixa indicada.',
      description: 'Boa base para acompanhar sua rotina. Continue observando força, medidas e desempenho.',
    };
  }

  if (value < 30) {
    return {
      value,
      label: 'Acima do indicado',
      status: 'above',
      headline: 'Seu IMC ficou acima da faixa indicada.',
      description: 'Esse indicador ajuda a acompanhar o peso corporal junto com treino, medidas e composição corporal.',
    };
  }

  return {
    value,
    label: 'Bem acima do indicado',
    status: 'high',
    headline: 'Seu IMC ficou bem acima da faixa indicada.',
    description: 'Vale acompanhar esse número com calma e considerar uma avaliação profissional para metas mais precisas.',
  };
}

export function calculateWeightGoalProjection(
  currentWeightKg: number,
  targetWeightKg: number,
  desiredTrainingDays = 4,
  startDate = new Date(),
): WeightGoalProjection | null {
  if (
    !Number.isFinite(currentWeightKg) ||
    !Number.isFinite(targetWeightKg) ||
    currentWeightKg <= 0 ||
    targetWeightKg <= 0
  ) {
    return null;
  }

  const amountKg = roundTo(Math.abs(currentWeightKg - targetWeightKg), 1);
  const percentChange = roundTo((amountKg / currentWeightKg) * 100, 1);

  if (amountKg < 0.1) {
    return {
      direction: 'maintain',
      amountKg: 0,
      percentChange: 0,
      weeklyRateKg: 0,
      weeks: 0,
      days: 0,
      targetDate: startDate,
      title: 'Você já está na sua meta de peso.',
      description: 'Agora o foco pode ser manter consistência, medidas e desempenho nos treinos.',
    };
  }

  const trainingDays = clamp(Math.round(desiredTrainingDays), 1, 7);
  const direction: WeightGoalDirection = targetWeightKg < currentWeightKg ? 'lose' : 'gain';
  const weeklyRateKg =
    direction === 'lose'
      ? roundTo(clamp(currentWeightKg * (0.004 + trainingDays * 0.0006), 0.25, 1), 1)
      : roundTo(clamp(0.15 + trainingDays * 0.035, 0.2, 0.45), 1);
  const weeks = Math.max(1, Math.ceil(amountKg / weeklyRateKg));
  const days = weeks * 7;
  const targetDate = addDays(startDate, days);

  return {
    direction,
    amountKg,
    percentChange,
    weeklyRateKg,
    weeks,
    days,
    targetDate,
    title:
      direction === 'lose'
        ? `Previsão para perder ${amountKg.toLocaleString('pt-BR')} kg`
        : `Previsão para ganhar ${amountKg.toLocaleString('pt-BR')} kg`,
    description:
      direction === 'lose'
        ? `Estimativa usando um ritmo medio de ${weeklyRateKg.toLocaleString('pt-BR')} kg por semana.`
        : `Estimativa usando um ritmo medio de ${weeklyRateKg.toLocaleString('pt-BR')} kg por semana.`,
  };
}

export function formatGoalDate(date: Date, referenceDate = new Date()) {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };

  if (date.getFullYear() !== referenceDate.getFullYear()) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString('pt-BR', options);
}

export function parseMetricValue(value: string) {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
