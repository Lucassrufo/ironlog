import { ExperienceLevel } from '../types/models';

export const levelContent: Record<ExperienceLevel, { title: string; description: string }> = {
  iniciante: {
    title: 'Iniciante',
    description: 'Rotina mais leve para fortalecimento do corpo.',
  },
  regular: {
    title: 'Regular',
    description: 'Rotina mais intensa com mais treinos por dia, para quem já tem certa constância.',
  },
  profissional: {
    title: 'Profissional',
    description: 'Treino focado e de alta exigência para quem já vive a rotina de academia.',
  },
};

export const levelOrder: ExperienceLevel[] = ['iniciante', 'regular', 'profissional'];
